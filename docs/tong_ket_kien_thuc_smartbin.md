# 📚 Tóm tắt Kiến thức: Code Arduino Thùng Rác Thông Minh (Smart Bin)

Tài liệu này dùng để các thành viên trong nhóm đọc nhanh, nắm bắt luồng logic và các kỹ thuật lập trình nhúng "thực chiến" được sử dụng trong dự án, thay vì phải đọc lại code từ đầu.

---

## ✅ 1. Những phần ĐÃ TÌM HIỂU (Kiến thức Cốt lõi)

Đây là những kỹ thuật đã được mổ xẻ chi tiết, là xương sống giúp hệ thống chạy ổn định.

### 1.1. Tối ưu bộ nhớ với `#define` *(Khảo sát [Dòng 10 - 20](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L10-L20))*
- **Cách làm:** Dùng `#define PIN_NAME 10` thay vì `int PIN_NAME = 10;` để đặt tên chân cắm.
- **Lý do:** Giúp tiết kiệm dung lượng RAM cực kỳ eo hẹp của Arduino (chỉ có 2KB), vì `#define` chỉ là lệnh thay thế chữ thành số trước khi biên dịch, không tốn dung lượng lưu trữ lúc chạy.

### 1.2. Kỹ thuật "Đa nhiệm" với `millis()` *(Khảo sát [Dòng 295 - 311](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L295-L311) và [Dòng 462 - 502](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L462-L502))*
- **Cách làm:** Tuyệt đối KHÔNG dùng `delay()`. Dùng `millis()` - chiếc đồng hồ bấm giờ chạy từ lúc cắm điện.
- **Công thức:** `if (millis() - mốc_thời_gian_cũ >= thời_gian_chờ) { ... }`
- **Lý do:** Khi dùng `delay()`, CPU bị "đóng băng", không thể nhận tín hiệu Wifi hay đo khoảng cách. Dùng `millis()` giúp hệ thống làm hàng chục việc cùng lúc (đo tay, đo gas, gửi dữ liệu, v.v.).

### 1.3. Lưu trữ cài đặt vĩnh viễn (EEPROM & `struct`) *(Khảo sát [Dòng 76 - 84](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L76-L84) và [Dòng 153 - 167](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L153-L167))*
- **Vấn đề:** Nếu lưu biến vào RAM, khi cúp điện (rút pin) sẽ mất sạch các cài đặt từ người dùng.
- **Cách giải quyết:** 
  - Gộp tất cả cài đặt (ngưỡng rác, âm lượng, nhiệt độ...) vào một "chiếc hộp" tên là `struct ConfigData`.
  - Dùng `EEPROM.put(0, myConfig)` để ghi nguyên chiếc hộp đó vào bộ nhớ ổ cứng của Arduino.
  - Dùng `EEPROM.get(0, myConfig)` để lôi ra khi khởi động.
- **Mẹo "Chữ ký" (Signature):** Dùng một mã bí mật (VD: `0xAC`) để biết con chip này là chip mới toanh (chưa có dữ liệu) hay chip đã được dùng để tự động nạp cấu hình mặc định.

### 1.4. Thuật toán "Biến cờ" (Flag) & Timer Đóng/Mở Nắp *(Khảo sát [Dòng 323 - 354](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L323-L354) và [Dòng 396 - 410](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L396-L410))*
- **Timer (Chờ rút tay):** Dùng `lidOpenTimer = millis()` để liên tục cập nhật mốc thời gian lúc người dùng thò tay vào. Khi rút tay ra, nắp sẽ dùng phép trừ để "chờ" thêm 3-5 giây rồi mới đóng.
- **Biến Cờ (Chống rè loa & giật Servo):** Dùng lệnh `if (shouldOpen != lastLidState)`. Hệ thống chỉ gửi tín hiệu ra loa và động cơ **1 LẦN DUY NHẤT** tại khoảnh khắc trạng thái bị thay đổi. Nếu không có nó, loa sẽ bị ép phát lại bài hát 50 lần/giây gây ra tiếng lạch cạch (rè).

### 1.5. Thuật toán đo % Rác ("Đo ngược") *(Khảo sát [Dòng 356 - 374](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L356-L374))*
- **Điều kiện kiên quyết:** Chỉ kích hoạt cảm biến đo rác khi **nắp đã đóng chặt** `if (!shouldOpen)`, tránh việc đo nhầm vào tay người dùng hoặc bắn sóng ra ngoài không khí.
- **Quy đổi Toán học:** 
  - Dùng hàm `map(khoảng_cách_đo_được, chiều_cao_thùng, khoảng_cách_cách_nắp, 0%, 100%)` để quy đổi ngược khoảng cách (cm) ra phần trăm (%) độ đầy của thùng rác.
  - Dùng hàm `constrain(gia_tri, 0, 100)` để khóa không cho % rác bị tụt xuống âm hoặc vọt lên quá 100%.

### 1.6. Giao tiếp Internet (JSON & Xử lý Chuỗi) *(Khảo sát [Dòng 237 - 293](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L237-L293) và [Dòng 483 - 494](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L483-L494))*
- **Gửi dữ liệu (Arduino -> Web):** Đóng gói dữ liệu cảm biến thành một chuỗi văn bản chuẩn JSON: `{"nhiet_do": 30, "rac": 85}` rồi đẩy qua Serial.
- **Nhận lệnh (Web -> Arduino):** Khi Web đẩy xuống chuỗi `config:90:500:25:30:29`, Arduino dùng hàm C++ cực mạnh là `sscanf()` để "chặt" chuỗi chữ này ra thành 5 con số nguyên nhét vào EEPROM.

---

## 🚧 2. Những phần CHƯA TÌM HIỂU (Kiến thức Nâng cao)

Đây là những kỹ thuật lập trình phần cứng chuyên sâu có trong code. Bạn không bắt buộc phải hiểu ngay lập tức để làm dự án, nhưng nếu muốn trở thành "Pro", đây là những thứ nên đọc thêm:

### 2.1. Điều khiển Servo bằng Hardware PWM (Chống giật) *(Khảo sát [Dòng 116 - 138](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L116-L138))*
- **Đoạn code:** Hàm `setupHardwareServo()` và `setServoAngle()`.
- **Vì sao phải làm thế?** Thư viện `<Servo.h>` truyền thống thường hay "đánh nhau" (xung đột ngắt) với thư viện `SoftwareSerial` (dùng cho Loa và Wifi), khiến nắp thùng rác thỉnh thoảng bị run lẩy bẩy hoặc kẹt. Tác giả đã can thiệp thẳng vào thanh ghi phần cứng (Timer1) của con chip Atmega328P để ép chân D10 phát xung tĩnh 50Hz mượt mà tuyệt đối.

### 2.2. Giao thức HEX (Mã máy) điều khiển DFPlayer *(Khảo sát [Dòng 93 - 114](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L93-L114))*
- **Đoạn code:** Hàm `dfSendCmd(uint8_t cmd, uint16_t arg)`.
- **Vì sao?** Tương tự như trên, dùng thư viện DFPlayer có sẵn đôi khi làm hệ thống bị "treo" vài chục mili-giây để đợi loa phản hồi. Tác giả đã nén trực tiếp yêu cầu thành 10 byte mã máy (Start byte, Checksum, End byte...) ném thẳng vào loa và quay đi làm việc khác mà không cần đợi.

### 2.3. Khởi tạo Ký tự Custom trên LCD I2C *(Khảo sát [Dòng 61 - 65](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L61-L65) và [Dòng 224 - 225](file:///c:/Users/nguye/Documents/Summer_2026/Study/IOT/IOT102/src/iot/code_arduino.ino#L224-L225))*
- **Đoạn code:** `byte kyTuDoC[8]` và hàm `lcd.createChar(0, kyTuDoC)`.
- **Nội dung:** Màn hình LCD bình thường không có biểu tượng độ C (°). Mã này định nghĩa từng điểm ảnh (pixel) nhị phân để tự vẽ ra cái vòng tròn nhỏ xíu biểu tượng độ C.

> [!TIP]
> **Lời khuyên cho team:** Hãy bám chắc phần **(1.2) Đa nhiệm millis** và **(1.4) Biến cờ Flag**. Nắm vững hai thứ này, bạn có thể tự tin code được bất kỳ dự án Nhà Thông Minh / IoT nào mà hệ thống không bao giờ bị đơ!
