#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h> // Thư viện đọc JSON

// --- Khai báo thư viện Âm thanh I2S ---
#include "AudioFileSourcePROGMEM.h"
#include "AudioGeneratorRTTTL.h"
#include "AudioOutputI2S.h"

const char* ssid = "S1007 2117";
const char* password = "21172117";

const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;
const char* mqtt_topic = "smarthome/bin/sensor_data";

WiFiClient espClient;
PubSubClient client(espClient);

// Khởi tạo Serial ảo giao tiếp với Arduino (RX=D1, TX=D2)
SoftwareSerial arduinoSerial(D1, D2);

// --- Cấu hình Đối tượng Âm thanh ---
AudioGeneratorRTTTL *rtttl;
AudioFileSourcePROGMEM *file = NULL;
AudioOutputI2S *out;

// Chuỗi âm thanh giả lập tiếng còi hú báo động liên tục
const char siren[] PROGMEM = "siren:d=8,o=5,b=200:c,e,c,e,c,e,c,e,c,e,c,e";
unsigned long lastAlarmTime = 0;

void setup_wifi() {
  delay(10);
  Serial.println("\nĐang kết nối Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Wi-Fi kết nối THÀNH CÔNG!");
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Đang kết nối MQTT Broker...");
    String clientId = "ESP8266-Gateway-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println(" ✅ Đã kết nối MQTT!");
    } else {
      Serial.print(" ❌ Thất bại, thử lại sau 5 giây...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(9600);         
  arduinoSerial.begin(9600);  
  
  // Ép Serial ảo không được chờ quá 50ms (Chống nghẽn âm thanh)
  arduinoSerial.setTimeout(50); // <--- THÊM DÒNG NÀY 
  
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);

  // --- Khởi động Bộ giải mã Âm thanh I2S ---
  out = new AudioOutputI2S();
  out->begin(); 
  
  // Hạ âm lượng kỹ thuật số xuống 10% để chống sốc mạch Amply
  out->SetGain(0.1); // <--- THÊM DÒNG NÀY
  
  rtttl = new AudioGeneratorRTTTL();
  
  Serial.println("\n====== TRẠM ESP8266 ĐÃ SẴN SÀNG LOA I2S ======");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // 1. LUÔN CHẠY VÒNG LẶP ÂM THANH: Để loa kêu mượt mà không bị vấp
  if (rtttl && rtttl->isRunning()) {
    if (!rtttl->loop()) {
      rtttl->stop();
      if (file) {
        delete file; // Giải phóng RAM khi kêu xong để chống treo mạch
        file = NULL;
      }
    }
  }

  // 2. NHẬN VÀ PHÂN TÍCH DỮ LIỆU TỪ ARDUINO
  if (arduinoSerial.available()) {
    String jsonData = arduinoSerial.readStringUntil('\n');
    jsonData.trim();
    
    if (jsonData.length() > 0 && jsonData.startsWith("{") && jsonData.endsWith("}")) {
      // Bắn thẳng lên Web
      client.publish(mqtt_topic, jsonData.c_str());
      Serial.println("Đã bắn Web: " + jsonData);

      // Phân tích JSON để lấy giá trị Mức rác và Khí Gas
      StaticJsonDocument<200> doc; 
      DeserializationError error = deserializeJson(doc, jsonData);
      
      if (!error) {
        int garbage_level = doc["garbage_level"];
        int gas = doc["gas"];

        // 3. KÍCH HOẠT BÁO ĐỘNG
        // Nếu rác đầy trên 80% HOẶC gas rò rỉ trên 500ppm
        if (garbage_level >= 80 || gas > 500) {
          
          // Cứ 5 giây mới cho hú 1 lần để không bị lặp đè tiếng
          if ((!rtttl->isRunning()) && (millis() - lastAlarmTime > 5000)) {
            if (file) delete file; // Dọn rác bộ nhớ trước khi nạp bài mới
            
            // Nạp file còi hú và cho chạy
            file = new AudioFileSourcePROGMEM(siren, strlen_P(siren));
            rtttl->begin(file, out);
            
            lastAlarmTime = millis();
            Serial.println("🚨 BÁO ĐỘNG: Đang hú còi ra loa!");
          }
        }
      } else {
        Serial.println("Lỗi đọc JSON, bỏ qua kiểm tra báo động.");
      }
    }
  }
}