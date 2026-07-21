# Hướng dẫn Khởi động và Thay đổi Mạng (Wi-Fi/IP)

Khi bạn mang mô hình (Sản phẩm IoT) sang một địa điểm khác, mạng Wi-Fi và địa chỉ IP của máy tính (Server) sẽ bị thay đổi. Dưới đây là các bước **chuẩn xác nhất** để cấu hình lại hệ thống mà không bị lỗi kết nối.

---

## 1. Tìm địa chỉ IP mới của máy tính
Khi kết nối vào Wi-Fi mới, máy tính của bạn sẽ được cấp một IP mới.
1. Mở **Command Prompt (cmd)** trên Windows.
2. Gõ lệnh: `ipconfig`
3. Tìm dòng **IPv4 Address** (Ví dụ: `192.168.1.45` hoặc `172.20.10.3`). Hãy ghi nhớ IP này.

---

## 2. Cấu hình lại phần cứng IoT (ESP8266)
Phần cứng cần biết tên Wi-Fi và Mật khẩu mới để truy cập Internet. Do dự án đang dùng MQTT Server Public (`test.mosquitto.org`) nên bạn **không cần** đổi IP MQTT.

1. Mở file `src/iot/code_esp8266.ino` bằng Arduino IDE.
2. Sửa lại thông tin Wi-Fi:
```cpp
const char* ssid = "TÊN_WIFI_MỚI";
const char* password = "MẬT_KHẨU_WIFI_MỚI";
```
3. Cắm cáp và ấn **Upload** code xuống mạch ESP8266.

---

## 3. Cấu hình lại Web Frontend (FE)
Nếu bạn muốn dùng điện thoại hoặc máy khác truy cập vào Web, Web cần biết IP chính xác của Backend thay vì chữ `localhost`.

1. Mở file `src/frontend/.env`
2. Đổi chữ `localhost` thành IP mới của máy tính bạn (ở Bước 1):
```env
# Đổi từ:
# VITE_API_URL=http://localhost:3001
# Thành:
VITE_API_URL=http://192.168.1.45:3001
```
3. Mở Terminal mới, trỏ vào thư mục `src/frontend` và chạy:
```bash
npm run dev
```

---

## 4. Cấu hình lại App Mobile (React Native)
Ứng dụng Mobile đã được thiết kế cực kỳ thông minh, bạn **không cần sửa code**!

1. Mở Terminal, trỏ vào thư mục `src/mobile` và chạy:
```bash
npm start -c
```
2. Mở App trên điện thoại thông qua Expo.
3. Chuyển sang **Tab Cài đặt (Settings)** ở góc dưới màn hình.
4. Ở mục **ĐỊA CHỈ IP SERVER**, hãy nhập IP mới của máy tính (Ví dụ: `192.168.1.45`).
5. Bấm nút **LƯU & KẾT NỐI LẠI**. App sẽ tự động kết nối lại với Backend mới.

---

## 5. Khởi động Backend (BE)
Backend tự động chạy trên mọi IP của máy, nên không cần sửa code.
1. Mở Terminal, trỏ vào thư mục `src/backend`.
2. Chạy lệnh:
```bash
node server.js
```

---

## 6. Khởi động AI (Machine Learning)
AI kết nối với SQL Server cục bộ (`localhost`) và MQTT Public, nên cũng không cần sửa code.
1. Mở Terminal, trỏ vào thư mục `src/ml`.
2. Chạy lệnh:
```bash
python predict.py
```

> **Mẹo vặt:**
> Thứ tự bật hệ thống khuyên dùng để tránh lỗi:
> 1. Bật Backend (Node.js) trước để lắng nghe kết nối.
> 2. Bật AI (Python).
> 3. Bật Frontend Web và App Mobile.
> 4. Cấp nguồn cho mô hình IoT (Thùng rác) cuối cùng.
