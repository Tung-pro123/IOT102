import time
import datetime
import warnings
import pymssql
import pandas as pd
from sklearn.linear_model import LinearRegression
import paho.mqtt.client as mqtt
import json

# Tắt các cảnh báo UserWarning của Pandas (SQLAlchemy)
warnings.filterwarnings('ignore', category=UserWarning)

# ================= CẤU HÌNH CSDL & MQTT =================
DB_SERVER = "localhost"
DB_USER = "sa"
DB_PASS = "12345"
DB_NAME = "SmartWasteDB"

MQTT_BROKER = "test.mosquitto.org"
MQTT_PORT = 1883
MQTT_TOPIC_PREDICTION = "smarthome/bin/prediction"

INTERVAL = 60 # Tính toán lại sau mỗi 60 giây

def analyze_peak_time():
    try:
        conn = pymssql.connect(server=DB_SERVER, user=DB_USER, password=DB_PASS, database=DB_NAME)
        query = """
            SELECT timestamp, garbage_level
            FROM GarbageHistory
            WHERE timestamp >= DATEADD(day, -7, GETDATE())
            ORDER BY timestamp ASC
        """
        df = pd.read_sql(query, conn)
        conn.close()

        if len(df) < 10:
            return None
        
        # Tính độ chênh lệch mức rác so với lần đo trước
        df['diff'] = df['garbage_level'].diff()
        
        # Lọc ra các lần mức rác tăng đột biến (> 2%), tức là có người vứt rác
        throws = df[df['diff'] > 2].copy()
        
        if len(throws) == 0:
            return None
            
        # Lấy ra giờ vứt rác
        throws['hour'] = throws['timestamp'].dt.hour
        
        # Tìm giờ xuất hiện nhiều nhất (mode)
        peak_hour = int(throws['hour'].mode()[0])
        return peak_hour
    except Exception as e:
        print(f"Lỗi khi phân tích giờ cao điểm: {e}")
        return None

# ================= KẾT NỐI MQTT =================
mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
print("Đang kết nối tới MQTT Broker...")
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()

def predict_full_time():
    try:
        # Kết nối tới CSDL
        conn = pymssql.connect(server=DB_SERVER, user=DB_USER, password=DB_PASS, database=DB_NAME)
        
        # Lấy dữ liệu của 7 ngày gần nhất (để vẽ lịch sử dài hạn và có bộ lọc trên giao diện)
        query = """
            SELECT timestamp, garbage_level
            FROM GarbageHistory
            WHERE timestamp >= DATEADD(day, -7, GETDATE())
            ORDER BY timestamp ASC
        """
        df = pd.read_sql(query, conn)
        conn.close()

        if len(df) < 5:
            print("Chưa đủ dữ liệu trong 7 ngày qua để thực hiện dự đoán.")
            return

        peak_hour = analyze_peak_time()
        peak_str = f"{peak_hour}:00 - {peak_hour+1}:00" if peak_hour is not None else "Đang thu thập..."

        # Lấy 30 điểm (giảm tiếp để quá khứ thưa hơn, nhìn đẹp hơn)
        history_data = []
        step = max(1, len(df) // 30)
        sampled = df.iloc[::step].tail(30)
        
        num_sampled = len(sampled)
        current_level = round(df.iloc[-1]['garbage_level'], 1)
        now_dt = datetime.datetime.now()
        now_seconds = int(now_dt.timestamp())

        # Tạo danh sách lịch sử: Điểm cuối cùng trong lịch sử sẽ đóng vai trò là điểm "Hiện tại"
        # để tránh bị lặp cột mốc thời gian trên trục Ox.
        for idx, (_, row) in enumerate(sampled.iterrows()):
            is_last = (idx == num_sampled - 1)
            time_str = row['timestamp'].strftime("%H:%M %d/%m")
            if is_last:
                time_str += " (Hiện tại)"
            
            history_data.append({
                "time": time_str,
                "timestamp": int(row['timestamp'].timestamp()),
                "actual": round(row['garbage_level'], 1),
                "prediction": round(row['garbage_level'], 1) if is_last else None
            })

        # ---------------- KHỞI TẠO MÔ HÌNH HỒI QUY DỰ ĐOÁN ----------------
        # Xác định chu kỳ đổ rác hiện tại để dự đoán chính xác tốc độ đầy của chu kỳ này
        # Một sự kiện đổ rác được định nghĩa khi mức rác giảm xuống đột ngột >= 15%
        df['diff'] = df['garbage_level'].diff()
        empty_events = df[df['diff'] <= -15]
        
        if len(empty_events) > 0:
            last_empty_time = empty_events.iloc[-1]['timestamp']
            df_cycle = df[df['timestamp'] >= last_empty_time].copy()
        else:
            df_cycle = df.copy()

        # Nếu chu kỳ hiện tại quá ngắn (ít hơn 5 mẫu), dùng toàn bộ dữ liệu 3 ngày để có độ dốc trung bình ổn định
        if len(df_cycle) < 5:
            df_cycle = df.copy()

        # Chuyển đổi sang giây để train
        df_cycle['time_seconds'] = df_cycle['timestamp'].astype('int64') // 10**9
        X = df_cycle[['time_seconds']].values
        y = df_cycle['garbage_level'].values

        model = LinearRegression()
        model.fit(X, y)

        slope = model.coef_[0]
        intercept = model.intercept_

        # Nếu rác đã đầy (> 95%)
        if current_level >= 95:
            msg = {
                "prediction": "Thùng rác đã đầy!",
                "peak_time": peak_str,
                "timestamp": now_seconds,
                "predicted_at_str": "Đã đầy",
                "history": history_data
            }
            mqtt_client.publish(MQTT_TOPIC_PREDICTION, json.dumps(msg), retain=True)
            print("Thùng rác đã đầy, dừng dự toán.")
            return

        # Nếu độ dốc <= 0 (rác đang đi ngang hoặc giảm), vẽ 15 điểm tương lai nằm ngang trong 15 tiếng tiếp theo (mật độ dày hơn)
        if slope <= 0:
            print("Mức rác ổn định, vẽ dự báo tương lai đi ngang chi tiết...")
            for i in range(1, 16):
                t_future = now_dt + datetime.timedelta(hours=i * 1.0)
                history_data.append({
                    "time": t_future.strftime("%H:%M %d/%m") + " (Dự báo)",
                    "timestamp": int(t_future.timestamp()),
                    "actual": None,
                    "prediction": current_level
                })
            
            msg = {
                "prediction": "Mức rác đang ổn định",
                "timestamp": now_seconds,
                "predicted_at_str": "-",
                "peak_time": peak_str,
                "history": history_data
            }
            mqtt_client.publish(MQTT_TOPIC_PREDICTION, json.dumps(msg), retain=True)
            return

        # Tìm thời điểm đầy 100%: y = slope * X + intercept => X = (100 - intercept) / slope
        time_full_seconds = (100 - intercept) / slope
        time_full_dt = datetime.datetime.fromtimestamp(time_full_seconds)
        
        # Tránh các dự báo vô lý (ví dụ dự báo đầy trong quá khứ hoặc quá xa > 7 ngày)
        max_future = now_dt + datetime.timedelta(days=7)
        if time_full_dt < now_dt or time_full_dt > max_future:
            time_full_dt = now_dt + datetime.timedelta(hours=24)
            time_full_seconds = time_full_dt.timestamp()
            
        prediction_str = time_full_dt.strftime("%H:%M %d/%m/%Y")
        print(f"Dự đoán đầy lúc: {prediction_str}")

        # Thêm 15 điểm tương lai để vẽ đường dự báo cực kỳ chi tiết và kéo dài hơn
        num_steps = 15
        for i in range(1, num_steps + 1):
            future_seconds = now_seconds + i * (time_full_seconds - now_seconds) / num_steps
            future_dt = datetime.datetime.fromtimestamp(future_seconds)
            future_level = current_level + i * (100 - current_level) / num_steps
            
            label = " (Đầy 100%)" if i == num_steps else " (Dự báo)"
            history_data.append({
                "time": future_dt.strftime("%H:%M %d/%m") + label,
                "timestamp": int(future_seconds),
                "actual": None,
                "prediction": round(future_level, 1)
            })

        msg = {
            "prediction": f"Dự kiến đầy lúc {prediction_str}",
            "timestamp": now_seconds,
            "predicted_at_str": prediction_str,
            "peak_time": peak_str,
            "history": history_data
        }
        mqtt_client.publish(MQTT_TOPIC_PREDICTION, json.dumps(msg), retain=True)

    except Exception as e:
        print(f"Lỗi trong quá trình dự đoán: {e}")

if __name__ == "__main__":
    print("Khởi động Machine Learning Service Dự đoán mức rác...")
    while True:
        predict_full_time()
        time.sleep(INTERVAL)
