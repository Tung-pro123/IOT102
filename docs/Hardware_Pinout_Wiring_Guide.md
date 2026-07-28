# 🔌 HƯỚNG DẪN ĐẤU NỐI CHÂN PHẦN CỨNG & GIẢI THÍCH LÝ DO KỸ THUẬT (ECOPULSE IOT)

**Dự án:** EcoPulse Smart Waste Management System  
**Bo mạch trung tâm:** Arduino UNO R3 + ESP8266 NodeMCU V2  

---

## 📊 1. BẢNG TỔNG HỢP SƠ ĐỒ ĐẤU NỐI CHÂN (PINOUT TABLE)

| STT | Thiết bị / Module | Chân trên Module | Kết nối đến (Arduino / Nguồn) | Vai trò / Lý do chọn chân |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Khối Nguồn Pin 3S** | 11.1V (+) <br> GND (-) | LM2596 IN+ <br> LM2596 IN- & GND chung | Nguồn tổng cung cấp năng lượng toàn hệ thống |
| **2** | **LM2596 Buck Converter** | OUT+ (5V) <br> OUT- (GND) | VCC Servo MG996R & Arduino VIN <br> GND chung toàn hệ thống | Hạ áp xuống chuẩn 5V, cấp dòng tải tối đa 3A cho Servo |
| **3** | **Servo MG996R** | VCC (Đỏ) <br> GND (Nâu/Đen) <br> SIG (Cam) | LM2596 OUT+ (5V) <br> GND chung <br> **Arduino D10** | **Chân PWM phần cứng (Timer1 16-bit)** để chống giật nắp |
| **4** | **Cảm biến Siêu âm 1 (Tay)** | VCC <br> GND <br> TRIG <br> ECHO | 5V <br> GND <br> **Arduino D3** <br> **Arduino D2** | Đo khoảng cách tay mở nắp rảnh tay |
| **5** | **Cảm biến Siêu âm 2 (Rác)** | VCC <br> GND <br> TRIG <br> ECHO | 5V <br> GND <br> **Arduino D9** <br> **Arduino D8** | Gắn dưới nắp thùng đo độ đầy rác % |
| **6** | **Cảm biến Khí Gas MQ-135** | VCC <br> GND <br> AO | 5V <br> GND <br> **Arduino A0** | Đọc tín hiệu Analog nồng độ khí độc/mùi hôi phân hủy |
| **7** | **Cảm biến Nhiệt/Ẩm DHT11** | VCC <br> GND <br> DATA | 5V <br> GND <br> **Arduino D7** | Đọc dữ liệu số nhiệt độ và độ ẩm thùng rác |
| **8** | **Màn hình LCD 16x2 I2C** | VCC <br> GND <br> SDA <br> SCL | 5V <br> GND <br> **Arduino A4** <br> **Arduino A5** | Chuẩn giao tiếp I2C hiển thị thông số tại chỗ |
| **9** | **Loa DFPlayer Mini** | VCC <br> GND <br> RX <br> TX <br> SPK1 / SPK2 | 5V <br> GND <br> **Arduino D5** <br> **Arduino D4** <br> Loa 3W | Giao tiếp Serial ảo (`SoftwareSerial`) phát âm thanh/còi báo động |
| **10** | **Gateway ESP8266** | VIN (3.3V/5V) <br> GND <br> D1 (RX) <br> D2 (TX) | 5V <br> GND <br> **Arduino D12 (TX)** <br> **Mạch phân áp ➔ Arduino D11 (RX)** | Kết nối Wi-Fi & MQTT truyền dữ liệu lên Web/App |

---

## 🔍 2. GIẢI THÍCH CHI TIẾT LÝ DO KỸ THUẬT TẠI SAO LẠI NỐI NHƯ VẬY

### ⚡ A. Khối Nguồn: Tại sao phải dùng Mạch hạ áp LM2596 (3A) nuôi Servo riêng?
* **Vấn đề:** Động cơ Servo MG996R nhông kim loại khi quay tải nặng kéo nắp thùng rác có thể rút dòng đỉnh lên tới **1.5A đến 2.5A**.
* **Giải pháp:** Chân 5V trên bo mạch Arduino chỉ chịu được dòng tối đa 0.5A. Nếu cắm Servo trực tiếp vào chân 5V của Arduino, hiện tượng sụt áp sẽ xảy ra làm vi điều khiển bị reset liên tục hoặc cháy chip ổn áp AMS1117.
* **Quyết định:** Dùng mạch hạ áp LM2596 lấy điện từ Pin 3S 11.1V hạ xuống 5V chuẩn với dòng tải lên tới 3A để nuôi riêng cho Servo.

---

### 🦾 B. Động cơ Servo MG996R: Tại sao bắt buộc cắm vào chân D10 của Arduino?
* **Vấn đề:** Thư viện `Servo.h` chuẩn dùng ngắt phần mềm (Software Interrupt) tạo xung PWM làm xung đột định thời với hàm `pulseIn()` của cảm biến siêu âm, khiến nắp thùng rác bị giật giật (jitter). Đồng thời ngắt này làm rớt ký tự khi đọc `SoftwareSerial`.
* **Giải pháp:** Chân **D10 (OC1B)** trên Arduino UNO được nối trực tiếp với **Bộ đếm phần cứng 16-bit Timer1**.
* **Quyết định:** Tự cấu hình thanh ghi Timer1 chạy Fast PWM thuần phần cứng ở tần số 50Hz (chu kỳ 20ms) trên chân D10. CPU hoàn toàn không tốn sức phát xung ngắt, giúp nắp thùng rác quay siêu mượt và không gây nhiễu Serial.

---

### 🌐 C. Kết nối Arduino với ESP8266: Tại sao dùng D11, D12 mà không dùng Chân 0 (RX) và Chân 1 (TX)?
* **Vấn đề 1 (Xung đột nạp code):** Chân 0 và 1 phần cứng nối với chip USB. Nếu cắm ESP8266 vào đây, mỗi lần nạp code từ máy tính sẽ bị lỗi `stk500_getsync() not in sync` do ESP8266 gây nhiễu tín hiệu.
* **Vấn đề 2 (Mất Log debug):** Dùng chân 0 và 1 thì không mở được màn hình `Serial Monitor` trên máy tính để soi lỗi.
* **Giải pháp:** Sử dụng thư viện `SoftwareSerial` tạo 2 chân Serial ảo trên **D11 (RX)** và **D12 (TX)** để giao tiếp với ESP8266, giữ rảnh hoàn toàn chân 0 và 1 cho cáp USB.

---

### 🛡️ D. Mạch Cầu Phân Áp Điện Trở (Voltage Divider) giữa Arduino và ESP8266
* **Vấn đề (Chênh lệch mức logic):** Chân TX của Arduino phát ra điện áp logic **5V**, trong khi chân RX của ESP8266 chỉ chịu được điện áp tối đa **3.3V**. Cắm trực tiếp 5V lâu ngày sẽ làm nóng và cháy (burn) chân RX của ESP8266.
* **Giải pháp:** Thiết kế mạch cầu phân áp gồm 2 điện trở: **R1 = 220Ω** và **R2 = 330Ω**.
* **Công thức hạ áp:**  
  `V_out = V_in * [R2 / (R1 + R2)] = 5V * [330 / (220 + 330)] = 3.00V` (Nằm trong ngưỡng an toàn 3.3V cho ESP8266).

---

### 🔊 E. Mạch Âm Thanh DFPlayer Mini: Tại sao nối chân D4, D5?
* DFPlayer Mini giao tiếp qua UART chuẩn Serial (tốc độ Baud 9600).
* Sử dụng cổng `SoftwareSerial dfSerial(4, 5)` trên Arduino giúp gửi trực tiếp các khung dữ liệu Hex 10-byte điều khiển phát bài hát/còi hú mà không ảnh hưởng tới cổng Serial chính.

---

### 📟 F. Màn hình LCD 16x2 I2C: Tại sao nối chân A4, A5?
* Màn hình LCD sử dụng Module chuyển đổi I2C (PCF8574) giúp giảm số dây nối từ 16 dây xuống chỉ còn **2 dây tín hiệu**.
* Chân **A4 (SDA - Data)** và **A5 (SCL - Clock)** trên Arduino UNO là 2 chân phần cứng I2C mặc định được điều khiển bởi khối TWI (Two Wire Interface).

---

📌 **TÓM LẠI:** Sơ đồ đấu nối của dự án EcoPulse IoT được tính toán kỹ lưỡng dựa trên nguyên lý Điện tử học và Kiến trúc Vi điều khiển, đảm bảo **an toàn điện áp (3.3V vs 5V), đủ công suất dòng tải (LM2596 3A), chống giật cơ học (Timer1 PWM D10) và cách ly lỗi xung đột phần mềm (Dual-MCU + SoftwareSerial)**!
