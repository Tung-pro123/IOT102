# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Mô tả dự án

Hệ thống IoT giám sát môi trường, cảnh báo và điều khiển tự động (Sử dụng đồng thời Arduino và ESP8266).

Cụ thể, đây là một thùng rác thông minh (Smart Waste Management) tự động mở/đóng nắp, giám sát môi trường và khí gas theo thời gian thực, cảnh báo bằng âm thanh, và dùng Machine Learning (hồi quy tuyến tính) để dự đoán thời điểm thùng rác đầy cũng như khung giờ đổ rác cao điểm. Dữ liệu được truyền qua MQTT tới một backend Node.js, lưu vào SQL Server, và hiển thị song song trên web dashboard (React) và mobile app (React Native/Expo).

## 2. Danh sách linh kiện phần cứng

- **Khối xử lý & Kết nối:**
  - Arduino (Uno/Nano) làm chip xử lý trung tâm, đọc cảm biến và điều khiển cơ cấu chấp hành.
  - ESP8266 đảm nhận kết nối Wi-Fi và truyền nhận dữ liệu lên ứng dụng/cloud.
- **Khối cảm biến (Sensors):**
  - 01 Cảm biến khói (Dòng MQ).
  - 01 Cảm biến nhiệt độ và độ ẩm (Dòng DHT).
  - 02 Cảm biến siêu âm đo khoảng cách (HC-SR04).
- **Khối hiển thị & Ngoại vi (Outputs):**
  - 01 Màn hình LCD tích hợp module chuyển đổi I2C.
  - 01 Động cơ Servo tải nặng MG996R.
  - 01 Mạch âm thanh DFPlayer Mini kết hợp loa 4 Ohm - 3W.

**Lưu ý cấp nguồn:** MG996R và DFPlayer Mini phải dùng nguồn ngoài 5V-2A riêng — tuyệt đối không kéo từ chân 5V của Arduino.

## Commands thường dùng

### Backend (Node.js — MQTT ⇄ SQL Server ⇄ WebSocket), tại thư mục gốc
```bash
npm install
node server.js       # hoặc: npm start
```
Server tự tạo database `SmartWasteDB` và bảng `GarbageHistory` nếu chưa tồn tại (xem `setupDatabase()` trong [server.js](server.js)). Yêu cầu SQL Server chạy tại `localhost` với user `sa` / pass `12345` (xem `dbConfig` trong `server.js`).

### AI Service — dự đoán bằng Machine Learning (Python)
```bash
pip install -r src/ml/requirements.txt
python src/ml/predict.py
```

### Web Dashboard (React + Vite + Tailwind)
```bash
cd src/frontend
npm install
npm run dev      # dev server (Vite)
npm run build    # production build
npm run lint     # eslint
```

### Mobile App (React Native / Expo)
```bash
cd src/mobile
npm install
npm start          # expo start
npm run android
npm run ios
npm run web
```
`SERVER_IP` trong [src/mobile/App.js](src/mobile/App.js) là IP LAN cứng của máy chạy backend — phải sửa tay mỗi khi đổi mạng Wi-Fi.

### Nạp code phần cứng (Arduino IDE)
- [src/iot/code_arduino.ino](src/iot/code_arduino.ino) → mạch Arduino Uno (logic chính thức: cảm biến, servo, LCD, DFPlayer, EEPROM).
- [src/iot/code_esp8266.ino](src/iot/code_esp8266.ino) → mạch ESP8266 (gateway Wi-Fi/MQTT).
- [src/iot/code_arduino_MG996R.ino](src/iot/code_arduino_MG996R.ino) là sketch stress-test độc lập (chỉ quay servo + phát nhạc liên tục để kiểm tra tải nguồn), không phải firmware chính thức — đừng nhầm với `code_arduino.ino`.

Không có test suite nào được cấu hình (`npm test` ở thư mục gốc chỉ in lỗi placeholder).

## Kiến trúc hệ thống

Luồng dữ liệu chạy qua 3 tầng, giao tiếp hoàn toàn qua JSON:

```
[Arduino Uno] --SoftwareSerial(JSON)--> [ESP8266] --MQTT (test.mosquitto.org)--> [Backend / Frontend]
```

- **Arduino ⇄ ESP8266:** Arduino gửi 1 dòng JSON/giây qua `SoftwareSerial` (chân ảo 11/12 trên Arduino, D1/D2 trên ESP8266) chứa `garbage_level`, `gas`, `humidity`, `temperature`, `is_lid_open`. ESP8266 forward JSON đó nguyên văn lên topic MQTT `smarthome/bin/sensor_data`.
- **Điều khiển ngược (Web/App → ESP8266 → Arduino):** Lệnh điều khiển (`open`, `close`, `auto`, `play_alarm`, `stop_alarm`, `config:trash:gas:height:vol:fullCm:openCm`) được publish lên topic `smarthome/bin/control`. ESP8266 vừa tự xử lý còi hú qua loa I2S on-board, vừa forward lệnh dạng text `CMD:<command>` xuống Arduino qua serial để điều khiển servo/DFPlayer/LCD. `code_esp8266.ino` chỉ tự đọc 2 trường đầu (`trash`, `gas`) cho logic còi báo động cục bộ của nó — phần đuôi dư (`height:vol:fullCm:openCm`) bị `sscanf` bỏ qua an toàn.
- **Cấu hình động:** 6 thông số — ngưỡng đầy rác (%), ngưỡng gas, chiều cao thùng (cm), âm lượng loa, khoảng cách coi là "đầy 100%" (cm, mặc định 5), khoảng cách mở nắp tự động khi có tay (cm, mặc định 15) — được gửi qua lệnh `config:trash:gas:height:vol:fullCm:openCm` và Arduino lưu **vĩnh viễn vào EEPROM** (struct `ConfigData`, có `signature` byte để phát hiện lần chạy đầu; đổi `signature` mỗi khi struct đổi kích thước để tránh đọc rác từ EEPROM cũ).
- **Cảm biến khí:** đã xác nhận là **MQ-135** (đo chất lượng không khí/khí gas — CO2, NH3, mùi hôi...), khớp với pin `MQ135_PIN` trong code và mô tả trong README. Không phải cảm biến khói (MQ-2) theo nghĩa hẹp.
- **SoftwareSerial dùng chung:** Trên Arduino, `dfSerial` (giao tiếp DFPlayer) và `espSerial` (giao tiếp ESP8266) đều là `SoftwareSerial` — chỉ một cổng được `listen()` tại một thời điểm, nên code luôn `dfSerial.listen()` trước khi gọi lệnh DFPlayer rồi `espSerial.listen()` lại ngay sau đó để không bị mất lệnh từ ESP8266.
- **Backend ([server.js](server.js)):** Subscribe cả `sensor_data` và `prediction` từ MQTT broker công cộng `test.mosquitto.org`. Lưu `garbage_level` vào SQL Server (`SmartWasteDB.GarbageHistory`), phát lại toàn bộ message qua WebSocket (cổng 3001) cho mobile app, và expose HTTP API `GET /api/history?date=YYYY-MM-DD` để tra cứu lịch sử theo ngày cụ thể.
- **ML service ([src/ml/predict.py](src/ml/predict.py)):** Vòng lặp vô hạn, mỗi 60 giây đọc lại 7 ngày dữ liệu từ SQL Server, xác định chu kỳ đổ rác hiện tại (dựa vào sự kiện mức rác giảm đột ngột ≥15%), huấn luyện `LinearRegression` trên chu kỳ đó để nội suy thời điểm đầy 100%, tính giờ cao điểm bằng mode của giờ xảy ra các lần đổ rác, rồi publish kết quả (retained) lên topic `smarthome/bin/prediction`.
- **Web Dashboard ([src/frontend](src/frontend)):** Không đi qua backend để lấy dữ liệu real-time — kết nối **trực tiếp** tới MQTT broker qua WebSocket bảo mật (`wss://test.mosquitto.org:8081/mqtt`) bằng thư viện `mqtt.js`. Chỉ gọi HTTP API của backend (`localhost:3001/api/history`) khi người dùng tra cứu lịch sử một ngày cụ thể trong quá khứ. Ngưỡng cấu hình (rác/gas/chiều cao/âm lượng/đầy-cm/mở nắp-cm) được cache ở `localStorage` và publish lại lên topic `control` mỗi khi lưu.
- **Mobile App ([src/mobile](src/mobile)):** Không kết nối MQTT trực tiếp — dùng WebSocket thuần tới backend (`ws://<SERVER_IP>:3001`) để nhận lại dữ liệu đã được backend relay, kèm auto-reconnect sau 3 giây nếu mất kết nối.

### Lưu ý khi sửa đổi
- Cấu trúc JSON của message sensor (`garbage_level`, `gas`, `humidity`, `temperature`, `is_lid_open`) và message prediction (`prediction`, `peak_time`, `history[]`) được dùng chung bởi backend, frontend web và mobile app — đổi field name ở một nơi phải đổi đồng bộ cả 4 nơi (Arduino, backend, frontend, mobile).
- Danh sách lệnh điều khiển (`open`/`close`/`auto`/`play_alarm`/`stop_alarm`/`config:...`) phải khớp giữa nơi publish (frontend `publishControl`) và nơi xử lý (`code_esp8266.ino` → `code_arduino.ino`).
- Broker MQTT (`test.mosquitto.org`) là broker công cộng dùng chung — dữ liệu không được mã hoá riêng và bất kỳ ai cũng có thể subscribe cùng topic.
