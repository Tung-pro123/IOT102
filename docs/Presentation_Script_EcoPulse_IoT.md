# 🎙️ KỊCH BẢN THUYẾT TRÌNH BẢO VỆ ĐỒ ÁN IOT102 (19 SLIDES)

**Dự án:** EcoPulse IoT - Smart Waste Management System powered by IoT & AI  
**Lớp / Nhóm:** SE2039 - Nhóm 5  
**Thành viên:**
1. Nguyễn Hải Dương - SE203568
2. Lê Thanh Tùng - SE203438 (Thuyết trình từ Slide 11 đến Slide 19)
3. Nguyễn Phước Lộc - SE203545
4. Nguyễn Văn Gia Bình - SE203555

---

## 📌 Slide 1: Cover Page (ECOPULSE IOT)
* **Tiêu đề:** ECOPULSE IOT - Smart Waste Management System powered by IoT & AI
* **Lời nói thuyết trình:**
  > "Kính chào quý thầy cô trong Hội đồng giám khảo. Chúng em là Nhóm 5 đại diện lớp SE2039. Hôm nay nhóm xin phép được báo cáo đồ án môn IOT102 với đề tài: **'EcoPulse IoT - Hệ thống quản lý thùng rác thông minh tích hợp IoT và Trí tuệ nhân tạo AI'**.  
  > Nhóm chúng em gồm 4 thành viên: Nguyễn Hải Dương, Lê Thanh Tùng, Nguyễn Phước Lộc và Nguyễn Văn Gia Bình. Kính mời thầy cô cùng đến với nội dung thuyết trình của nhóm em."

---

## 📌 Slide 2: The Problem Statement (Bài toán thực tế & Lý do áp dụng AI)
* **Nội dung trình bày trên Slide 2:**
  ```text
  THE PROBLEM: HOUSEHOLD WASTE MANAGEMENT CHALLENGES

  1. UNHYGIENIC MANUAL HANDLING (MẤT VỆ SINH)
     - Issue: Direct hand contact with dirty bin lids.
     - Impact: Bacterial cross-contamination for family members.

  2. UNMONITORED ODOR & HAZARDS (Ô NHIỄM KHÔNG GIAN SỐNG)
     - Issue: Food waste decomposes inside households undetected.
     - Impact: Toxic gas build-up (MQ-135) and foul odor affecting living environment.

  3. THE BLIND SPOT IN DUMP TIMING (NỖI ĐAU CẦN AI GIẢI QUYẾT)
     - Issue: Conventional sensors only passively report current fill % (e.g., 40%).
     - Impact: Users cannot guess WHEN it will reach 100% full. 
     - AI Solution: Linear Regression predicts EXACT 100% full time & peak dump hours.
  ```

* **Lời nói thuyết trình (Cuốn hút, làm nổi bật vai trò của AI):**
  > "Kính thưa thầy cô trong Hội đồng giám khảo, trước khi đi vào giải pháp kỹ thuật, em xin phép đặt ra bài toán thực tế trong quản lý rác thải sinh hoạt tại **Hộ gia đình** mà dự án EcoPulse IoT hướng tới giải quyết:  
  > 
  > Trong sinh hoạt hằng ngày tại các gia đình hiện đại, chúng ta đang gặp phải **3 nỗi đau thực tế**:  
  > 
  > 1. **Nỗi đau thứ nhất – Mất vệ sinh khi thao tác thủ công:** Người dùng phải dùng tay tiếp xúc trực tiếp với nắp thùng rác dơ bẩn mỗi khi vứt rác, tiềm ẩn nguy cơ lây nhiễm vi khuẩn cho gia đình.  
  > 
  > 2. **Nỗi đau thứ hai – Ô nhiễm không gian sống & Khí độc:** Rác thức ăn hữu cơ khi để trong nhà sẽ nhanh chóng phân hủy, phát tán khí độc (MQ-135) và bốc mùi hôi thối mà không có cảm biến giám sát tự động.  
  > 
  > 3. **Nỗi đau thứ ba – Nút thắt lớn nhất: Sự thụ động về thời gian trút rác (Nơi AI nhảy vào giải quyết):**  
  > nếu chỉ dùng cảm biến thông thường, thùng rác chỉ biết báo số phần trăm thụ động ở hiện tại (ví dụ: 40%). Nhưng người dùng bận rộn đi làm, đi chơi thì làm sao biết 40% đó nghĩa là 2 tiếng nữa đầy hay 5 tiếng nữa đầy?  
  > **Chính vì vậy, nhóm em đưa AI Hồi quy tuyến tính vào để giải quyết đúng bài toán này:** AI tự động học tốc độ dâng rác để dự báo chính xác mốc giờ rác sẽ trút đầy 100%, đồng thời phân tích khung giờ cao điểm vứt rác của gia đình, giúp gia chủ hoàn toàn chủ động thời gian sinh hoạt ạ!"

---

## 📌 Slide 3: Our Solution (Giải pháp EcoPulse IoT)
* **Nội dung slide:** Auto Lid Control, Real-Time Sensing, Instant Alerts, AI Optimization
* **Lời nói thuyết trình:**
  > "Để giải quyết triệt để 3 nỗi đau trên, nhóm em đã xây dựng hệ thống **EcoPulse IoT** với 4 trụ cột giải pháp:  
  > 1. **Auto Lid Control:** Tự động mở/đóng nắp bằng động cơ Servo MG996R giúp người dùng bỏ rác rảnh tay, đảm bảo vệ sinh tuyệt đối.  
  > 2. **Real-Time Sensing:** Giám sát liên tục các chỉ số khí gas, nhiệt độ, độ ẩm và mức rác trực tiếp tại thiết bị.  
  > 3. **Instant Alerts:** Cảnh báo âm thanh giọng nói tại chỗ qua loa DFPlayer Mini và đẩy thông báo tức thì lên App di động khi có sự cố.  
  > 4. **AI Optimization:** Áp dụng mô hình AI Hồi quy tuyến tính để dự báo thời gian rác đầy và tìm ra khung giờ vứt rác cao điểm, giúp gia chủ chủ động thời gian trút rác."

---

## 📌 Slide 4: Micro Controller (Khối điều khiển trung tâm)
* **Nội dung slide:** ESP8266_NODEMCU_V2 & ARDUINO_UNO_R3
* **Lời nói thuyết trình:**
  > "Về phần cứng điều khiển trung tâm, nhóm em sử dụng **Kiến trúc 2 vi điều khiển (Dual-MCU)**:  
  > * **Arduino UNO R3:** Đảm nhận nhiệm vụ đo đạc cảm biến và điều khiển động cơ tại chỗ với tần số PWM phần cứng chuẩn xác.  
  > * **ESP8266 NodeMCU V2:** Đóng vai trò là Gateway kết nối Wi-Fi, chịu trách nhiệm truyền nhận dữ liệu qua giao thức MQTT.  
  > Việc tách biệt 2 mạch giúp hệ thống tại chỗ luôn hoạt động mượt mà, nắp không bị giật hay đơ dù mạng Wi-Fi bị đứt."

---

## 📌 Slide 5: Input Devices (Thiết bị đầu vào)
* **Nội dung slide:** HC-SR04, MQ_135, DHT_11
* **Lời nói thuyết trình:**
  > "Hệ thống thu thập dữ liệu môi trường thông qua 3 cụm cảm biến đầu vào:  
  > 1. **HC-SR04 (Siêu âm):** Gồm 2 cảm biến – 1 cái đo khoảng cách tay người để mở nắp tự động, 1 cái gắn ở nắp để đo khoảng cách độ đầy rác.  
  > 2. **MQ-135:** Đo nồng độ khí thải, khí gas rò rỉ và mùi hôi phân hủy rác hữu cơ.  
  > 3. **DHT11:** Đo nhiệt độ và độ ẩm môi trường bên trong thùng rác để phát hiện nguy cơ quá nhiệt, cháy nổ."

---

## 📌 Slide 6: Output Devices (Thiết bị đầu ra)
* **Nội dung slide:** DFPLAYER_MINI, SERVO_MG996R, LCD 16X2 MODULE I2C
* **Lời nói thuyết trình:**
  > "Tương ứng với các đầu vào, thiết bị đầu ra gồm 3 thành phần:  
  > 1. **DFPlayer Mini + Loa 3W:** Phát các thông báo giọng nói ('Xin mời bỏ rác', 'Xin cảm ơn') và còi báo động khẩn cấp.  
  > 2. **Servo MG996R (Nhông kim loại):** Cung cấp lực kéo mạnh mẽ 10kg/cm để đóng mở nắp thùng rác mượt mà, bền bỉ.  
  > 3. **Màn hình LCD 16x2 I2C:** Hiển thị trực tiếp các thông số nhiệt độ, khí gas, phần trăm rác tại thiết bị."

---

## 📌 Slide 7: Block Diagram (Sơ đồ khối hệ thống)
* **Nội dung slide:** Input Layer -> Control Layer -> Output Layer & Network and Application Layer
* **Lời nói thuyết trình:**
  > "Slide này thể hiện sơ đồ phân tầng hệ thống của EcoPulse IoT gồm 4 lớp chính:  
  > * **Input Layer:** Thu thập dữ liệu từ cảm biến HC-SR04, MQ-135, DHT11 truyền về Arduino.  
  > * **Control Layer:** Arduino xử lý logic tại chỗ và giao tiếp Nối tiếp (Serial) với ESP8266.  
  > * **Network Layer:** ESP8266 kết nối với MQTT Broker (`test.mosquitto.org`).  
  > * **Application Layer:** MQTT Broker phân phát dữ liệu đến Backend Server Node.js, CSDL SQL Server, Module Python AI và giao diện Web/App."

---

## 📌 Slide 8: Schematic Diagram (Sơ đồ mạch nguyên lý)
* **Nội dung slide:** Sơ đồ đấu nối dây mạch điện tử EasyEDA
* **Lời nói thuyết trình:**
  > "Đây là sơ đồ đấu nối mạch nguyên lý hoàn chỉnh được nhóm thiết kế trên phần mềm EasyEDA.  
  > Điểm kỹ thuật quan trọng ở đây là nhóm sử dụng **Mạch giảm áp LM2596 Buck Converter** hạ từ Pin 3S 11.1V xuống 5V (chịu tải tối đa 3A) để nuôi riêng cho động cơ Servo MG996R. Nhóm không lấy điện 5V trực tiếp từ Arduino nhằm tránh hiện tượng quá tải sụt áp làm sập vi điều khiển."

---

## 📌 Slide 9: Wiring Pinout Table (Bảng chân kết nối)
* **Nội dung slide:** Chi tiết kết nối các chân vi điều khiển và cảm biến
* **Lời nói thuyết trình:**
  > "Bảng này tổng hợp toàn bộ các chân đấu nối phần cứng:  
  > * Động cơ Servo MG996R nối với chân **D10 (Timer1 Hardware PWM)** của Arduino để chống giật nắp.  
  > * Loa DFPlayer Mini nối chân D4, D5 qua SoftwareSerial.  
  > * ESP8266 giao tiếp với Arduino qua chân D1, D2 (`SoftwareSerial`). Nhóm đã thiết kế thêm mạch cầu phân áp điện trở (220Ω / 330Ω) để hạ tín hiệu 5V xuống 3.3V an toàn cho chân RX của ESP8266."

---

## 📌 Slide 10: Algorithm - Arduino Flowchart (Sơ đồ thuật toán Arduino)
* **Nội dung slide:** Chu trình hoạt động tại chỗ của Arduino UNO R3
* **Lời nói thuyết trình:**
  > "Sơ đồ thuật toán tại Arduino UNO R3 vận hành theo chu trình tuần tự:  
  > Khởi tạo thiết bị ➔ Đọc cảm biến môi trường (2s/lần) ➔ Đo khoảng cách tay mở nắp ➔ Đánh giá các nguy cơ cháy nổ/khí gas để kích hoạt loa DFPlayer ➔ Đo mức rác khi nắp đóng ➔ Đóng gói chuỗi JSON và bắn sang ESP8266 1 giây/lần."

---

## 📌 Slide 11: Algorithm - ESP8266 & MQTT Flowchart (Sơ đồ thuật toán ESP8266 - Chi tiết từng khối)
* **Người thuyết trình cá nhân:** Lê Thanh Tùng  
* **Lời nói thuyết trình:**
  > "Kính thưa thầy cô, em xin phép đại diện báo cáo từ **Slide 11 – Sơ đồ thuật toán của Gateway ESP8266 và Giao thức MQTT** qua từng khối xử lý cụ thể trên sơ đồ:  
  > 1. Khởi tạo Serial (9600) và cổng ảo `SoftwareSerial(D1, D2)`.  
  > 2. Check Wi-Fi (`setup_wifi()`). Nếu NO lặp đứng chờ, YES chuyển xuống cấu hình MQTT.  
  > 3. Configure MQTT (`client.setServer()`, `client.setCallback()`).  
  > 4. Check MQTT connection (`client.connected()`). Nếu YES xuống xử lý tin nhắn, NO rẽ sang Reconnect.  
  > 5. Reconnect MQTT (`client.connect()`). Khi kết nối lại thành công, gọi `client.subscribe("smarthome/bin/control")` đúng 1 lần duy nhất để đăng ký kênh nhận lệnh.  
  > 6. Process MQTT message (`client.loop()`) duy trì Ping ngầm và mở hòm thư nhận lệnh.  
  > 7. Check MQTT Command. Nếu YES kích hoạt `callback()` gửi `CMD:open` xuống Arduino; nếu NO đi xuống kiểm tra Arduino.  
  > 8. Check Arduino Data Available. Nếu YES (`arduinoSerial.available()`), bóc tách JSON chuẩn rồi gọi `client.publish()` đẩy dữ liệu rác, gas, nhiệt độ lên topic `smarthome/bin/sensor_data`."

---

## 📌 Slide 12: Website — Live Dashboard
* **Nội dung slide:** Màn hình giám sát Web thời gian thực (Real-time Monitoring)
* **Lời nói thuyết trình:**
  > "Đến với **Slide 12 – Giao diện Web Live Dashboard**.  
  > Giao diện Web kết nối trực tiếp với Server Node.js thông qua **giao thức Native HTML5 WebSocket (cổng 3001)**. Màn hình hiển thị mô hình Thùng rác sống tự động dâng/hạ nước rác, các thẻ chỉ số Khí gas, Nhiệt độ, Độ ẩm, Nhật ký Live MQTT Console, Bảng chẩn đoán sức sống hệ thống và Trung tâm nút bấm điều khiển tức thì."

---

## 📌 Slide 13: Mobile App — AI Analytics
* **Nội dung slide:** Giao diện Phân tích Thống kê AI trên ứng dụng React Native
* **Lời nói thuyết trình:**
  > "Đến với **Slide 13 – Màn hình AI Analytics trên Ứng dụng Di động React Native**.  
  > Màn hình này mang đến bộ 3 thẻ thống kê tuần (Trung bình rác %, Đỉnh điểm %, Số lần đổ rác), Biểu đồ biến động lượng rác tích lũy theo thời gian và Biểu đồ phân bố lượng rác theo giờ, từ đó đưa ra gợi ý thời gian trút rác hợp lý cho gia đình."

---

## 📌 Slide 14: Mobile App — Command Center
* **Nội dung slide:** Màn hình Trung tâm Điều khiển trên Mobile App
* **Lời nói thuyết trình:**
  > "Tại **Slide 14 – Trung tâm điều khiển Command Center trên App Mobile**.  
  > Người dùng tương tác 2 chiều với thùng rác từ xa qua mạng kết nối WebSocket và REST API fallback. Màn hình tích hợp mô hình thùng rác 3D, các thẻ môi trường và cụm 5 nút bấm điều khiển: MỞ NẮP, ĐÓNG NẮP, TỰ ĐỘNG (AI), BÁO ĐỘNG SOS khẩn cấp và TẮT CÒI."

---

## 📌 Slide 15: Website — AI Analytics (Machine Learning)
* **Nội dung slide:** Phân tích Dự báo AI bằng Hồi quy tuyến tính (Linear Regression)
* **Lời nói thuyết trình:**
  > "Kính thưa thầy cô, **Slide 15** là điểm sáng công nghệ cốt lõi – **Module Phân tích Dự báo AI chạy bằng Thuật toán Hồi quy tuyến tính (Linear Regression)** trong Python.  
  > Script Python tự động tìm điểm vừa trút rác (`diff < -15%`) để cắt lấy chu kỳ rác mới nhất, đưa vào `model.fit()` tính ra tốc độ dâng `slope` và giải phương trình `(100 - intercept) / slope` để tính thời điểm rác đầy 100%. Kết quả được vẽ thành đường đồ thị nét đứt màu vàng dự báo tương lai cực kỳ trực quan."

---

## 📌 Slide 16: Mobile App — System Management
* **Nội dung slide:** Cấu hình hệ thống, IP Server, Light/Dark Mode & Sơ đồ đấu nối
* **Lời nói thuyết trình:**
  > "Đến với **Slide 16 – Màn hình Quản trị Hệ thống trên App Mobile**.  
  > Màn hình hỗ trợ nút chuyển đổi Chế độ Sáng/Tối, tính năng Dynamic IP binding cho phép đổi IP Server Node.js mà không cần rebuild App, Form cấu hình 5 ngưỡng phần cứng IoT lưu xuống EEPROM Arduino và Bảng sơ đồ đấu nối chân chi tiết."

---

## 📌 Slide 17: AI Audit Log & Human Reflection
* **Nội dung slide:** Nhật ký Đóng góp AI & Tư duy Phản biện của Sinh viên
* **Lời nói thuyết trình:**
  > "Kính thưa thầy cô, **Slide 17** thể hiện quá trình làm việc và tư duy phản biện của nhóm thông qua Nhật ký Đóng góp AI:  
  > * Log #001: Bác bỏ AI nối trực tiếp chân 5V ➔ Tự thiết kế Mạch cầu phân áp 220Ω/330Ω hạ về 3.0V an toàn cho ESP8266.  
  > * Log #002: Chấp nhận AI dùng Hồi quy tuyến tính nhưng tự bổ sung Thuật toán lọc chu kỳ rác mới nhất (`diff < -15%`).  
  > * Log #004: Cấu hình `SoftwareSerial` trên chân D11 & D12 (9600 baud) để giữ rảnh cổng USB phần cứng nạp code và soi log `Serial Monitor`."

---

## 📌 Slide 18: Conclusion, Limitations & Future Work
* **Nội dung slide:** Tổng kết thành công, 3 Hạn chế hiện tại & Lộ trình phát triển tương lai
* **Lời nói thuyết trình:**
  > "Kính thưa thầy cô, tại Slide 18: Nhóm em hoàn thiện 100% mục tiêu đề ra với hệ thống IoT gia đình hoàn chỉnh. Nhóm thẳng thắn nhìn nhận 3 hạn chế (Cảm biến siêu âm nhạy cảm bề mặt, chưa tự phân loại rác tại chỗ và pin sạc thủ công). Từ đó đề ra 3 hướng phát triển: Tích hợp Camera AI YOLOv8 phân loại rác, lắp Pin Năng lượng Mặt trời và nâng cấp AI LSTM dự báo sinh hoạt."

---

## 📌 Slide 19: Thank You For Watching & Chuyển sang phần Demo Live
* **Nội dung slide:** Slide kết thúc bài thuyết trình
* **Lời nói thuyết trình:**
  > "Kính thưa quý thầy cô trong Hội đồng, phần báo cáo lý thuyết của Nhóm 5 đến đây là kết thúc. Em xin chân thành cảm ơn thầy cô đã chú ý theo dõi.  
  > Sau đây em xin phép được thực hiện phần Demo trực tiếp thiết bị thùng rác vật lý kết hợp giao diện Web Dashboard và App Mobile ngay trên bàn bảo vệ. Em xin kính mời quý thầy cô cùng theo dõi và đưa ra các câu hỏi góp ý cho nhóm em ạ!"
