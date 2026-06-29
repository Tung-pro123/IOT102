import time
import datetime
import pymssql
import pandas as pd
from sklearn.linear_model import LinearRegression
import paho.mqtt.client as mqtt
import json
import warnings

# Tắt các cảnh báo UserWarning của Pandas (SQLAlchemy)
warnings.filterwarnings('ignore', category=UserWarning)

# ================= CẤU HÌNH =================
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
        
        # Lấy dữ liệu của 24h gần nhất
        query = """
            SELECT timestamp, garbage_level
            FROM GarbageHistory
            WHERE timestamp >= DATEADD(hour, -24, GETDATE())
            ORDER BY timestamp ASC
        """
        df = pd.read_sql(query, conn)
        conn.close()

        if len(df) < 5:
            print("Chưa đủ dữ liệu để dự đoán (cần ít nhất 5 bản ghi trong 24h qua).")
            return

        peak_hour = analyze_peak_time()
        peak_str = f"{peak_hour}:00 - {peak_hour+1}:00" if peak_hour is not None else "Đang thu thập..."

        # Chỉ dự đoán nếu mức rác đang tăng dần hoặc chưa đầy (dưới 95%)
        latest_level = df.iloc[-1]['garbage_level']
        if latest_level >= 95:
            msg = {
                "prediction": "Thùng rác đã đầy!",
                "peak_time": peak_str
            }
            mqtt_client.publish(MQTT_TOPIC_PREDICTION, json.dumps(msg))
            print("Đã đầy, không cần dự đoán.")
            return

        # Chuyển đổi timestamp sang giây (Unix time) để làm trục X
        df['time_seconds'] = df['timestamp'].astype('int64') // 10**9
        
        X = df[['time_seconds']].values
        y = df['garbage_level'].values

        # Khởi tạo và huấn luyện mô hình Linear Regression
        model = LinearRegression()
        model.fit(X, y)

        slope = model.coef_[0]
        intercept = model.intercept_

        # Nếu độ dốc <= 0 (rác đang giảm hoặc không thay đổi), không thể dự đoán khi nào đầy
        if slope <= 0:
            print("Mức rác không tăng, chưa thể dự đoán.")
            msg = {
                "prediction": "Mức rác đang ổn định",
                "timestamp": int(time.time()),
                "predicted_at_str": "-",
                "peak_time": peak_str
            }
            mqtt_client.publish(MQTT_TOPIC_PREDICTION, json.dumps(msg))
            return

        # Tìm X khi y = 100
        # y = slope * X + intercept  =>  X = (100 - intercept) / slope
        time_full_seconds = (100 - intercept) / slope

        # Chuyển đổi lại thành datetime
        time_full_dt = datetime.datetime.fromtimestamp(time_full_seconds)
        
        # Format string
        prediction_str = time_full_dt.strftime("%H:%M %d/%m/%Y")
        print(f"Dự đoán thời gian đầy 100%: {prediction_str}")

        # Publish lên MQTT
        msg = {
            "prediction": f"Dự kiến đầy lúc {prediction_str}",
            "timestamp": int(time.time()),
            "predicted_at_str": prediction_str,
            "peak_time": peak_str
        }
        mqtt_client.publish(MQTT_TOPIC_PREDICTION, json.dumps(msg))

    except Exception as e:
        print(f"Lỗi trong quá trình dự đoán: {e}")

if __name__ == "__main__":
    print("Khởi động Machine Learning Service Dự đoán mức rác...")
    while True:
        predict_full_time()
        time.sleep(INTERVAL)
