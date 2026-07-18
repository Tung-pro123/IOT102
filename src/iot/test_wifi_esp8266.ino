#include <ESP8266WiFi.h>

// Tên và mật khẩu Wi-Fi (Sửa lại nếu cần)
const char* ssid = "Tung";
const char* password = "12345678910";

// Chân đèn LED tích hợp trên bo mạch NodeMCU (thường là chân D4 / GPIO2)
const int ledPin = 2; 

void setup() {
  // Cài đặt tốc độ Serial
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  
  // Đợi một chút cho Serial Monitor mở lên
  delay(2000);
  
  Serial.println();
  Serial.println("=========================================");
  Serial.println("BÀI TEST ESP8266: KIỂM TRA SỰ SỐNG & WIFI");
  Serial.println("=========================================");
  
  Serial.print("Đang kết nối vào Wi-Fi: ");
  Serial.println(ssid);

  // Đảm bảo mạch ở chế độ nhận Wi-Fi (Station Mode)
  WiFi.mode(WIFI_STA); 
  WiFi.disconnect();
  delay(100);
  
  WiFi.begin(ssid, password);
}

void loop() {
  // --- HIỆU ỨNG NHÁY ĐÈN CHỐNG TREO ---
  // Nếu đèn LED xanh dương trên mạch chớp tắt liên tục mỗi 1 giây
  // => Mạch đang sống 100%, code chạy bình thường, KHÔNG BỊ HỎNG CHIP.
  digitalWrite(ledPin, LOW);  // Bật đèn (NodeMCU kích mức thấp)
  delay(500);
  digitalWrite(ledPin, HIGH); // Tắt đèn
  delay(500);

  // --- IN TRẠNG THÁI WI-FI RA SERIAL MONITOR ---
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("✅ THÀNH CÔNG! Đã kết nối Wi-Fi. Địa chỉ IP của mạch: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("⏳ Đang dò tìm Wi-Fi... (Nếu cứ báo dò tìm mãi: Do sai Mật khẩu/Tên, hoặc bạn đang phát Wi-Fi 5GHz)");
  }
}
