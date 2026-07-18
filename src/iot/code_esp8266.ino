#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

// --- Khai báo thư viện Âm thanh I2S ---
#include "AudioFileSourcePROGMEM.h"
#include "AudioGeneratorRTTTL.h"
#include "AudioOutputI2S.h"

const char* ssid = "Tung";
const char* password = "12345678910";

const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;
const char* mqtt_topic_sensor = "smarthome/bin/sensor_data";
const char* mqtt_topic_control = "smarthome/bin/control";

WiFiClient espClient;
PubSubClient client(espClient);
SoftwareSerial arduinoSerial(D1, D2); // RX=D1, TX=D2

// --- Cấu hình Đối tượng Âm thanh ---
AudioGeneratorRTTTL *rtttl;
AudioFileSourcePROGMEM *file = NULL;
AudioOutputI2S *out;

const char siren[] PROGMEM = "siren:d=8,o=5,b=200:c,e,c,e,c,e,c,e,c,e,c,e";
unsigned long lastAlarmTime = 0;

int nguongDayRac = 80;
int nguongGas = 500;

// Hàm phụ trợ điều khiển còi hú I2S
void triggerSiren(bool play) {
  if (play) {
    if (rtttl && !rtttl->isRunning()) {
      if (file) delete file;
      file = new AudioFileSourcePROGMEM(siren, strlen_P(siren));
      rtttl->begin(file, out);
      Serial.println(F("🚨 Hú còi I2S!"));
    }
  } else {
    if (rtttl && rtttl->isRunning()) {
      rtttl->stop();
      Serial.println(F("🔇 Tắt còi I2S!"));
    }
    if (file) {
      delete file;
      file = NULL;
    }
  }
}

// Xử lý nhận lệnh từ Web (MQTT)
void callback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<128> doc;
  if (deserializeJson(doc, payload, length) != DeserializationError::Ok) {
    Serial.println(F("❌ Lỗi đọc JSON command!"));
    return;
  }

  const char* command = doc["command"];
  if (!command) return;

  // Chuyển tiếp lệnh cơ học xuống Arduino
  arduinoSerial.printf("CMD:%s\n", command);
  Serial.printf("➡ Chuyển tiếp Arduino: CMD:%s\n", command);

  // Tự xử lý còi hú/cấu hình trên ESP8266
  if (strcmp(command, "play_alarm") == 0) {
    triggerSiren(true);
  } else if (strcmp(command, "stop_alarm") == 0) {
    triggerSiren(false);
  } else if (strncmp(command, "config:", 7) == 0) {
    sscanf(command, "config:%d:%d", &nguongDayRac, &nguongGas);
    Serial.printf("⚙️ Cập nhật ngưỡng - Rác: %d%%, Gas: %d ppm\n", nguongDayRac, nguongGas);
  }
}

void setup_wifi() {
  delay(10);
  Serial.printf("\nKết nối WiFi: %s ", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(F("\n✅ WiFi kết nối THÀNH CÔNG!"));
}

void reconnect() {
  while (!client.connected()) {
    Serial.print(F("Kết nối MQTT..."));
    String clientId = "ESP8266-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      Serial.println(F(" OK!"));
      client.subscribe(mqtt_topic_control);
    } else {
      Serial.println(F(" Lỗi! Thử lại sau 5s..."));
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(9600);         
  arduinoSerial.begin(9600);  
  arduinoSerial.setTimeout(50); 
  
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  // Khởi động loa I2S
  out = new AudioOutputI2S();
  out->begin(); 
  out->SetGain(0.1); // Giới hạn âm lượng 10% chống sụt nguồn
  rtttl = new AudioGeneratorRTTTL();
  
  Serial.println(F("====== GATEWAY ESP8266 SẴN SÀNG ====="));
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // Luôn chạy vòng lặp âm thanh
  if (rtttl && rtttl->isRunning()) {
    if (!rtttl->loop()) {
      rtttl->stop();
      if (file) {
        delete file;
        file = NULL;
      }
    }
  }

  // Nhận dữ liệu từ Arduino gửi lên
  if (arduinoSerial.available()) {
    String jsonData = arduinoSerial.readStringUntil('\n');
    jsonData.trim();
    
    if (jsonData.length() > 0 && jsonData.startsWith("{") && jsonData.endsWith("}")) {
      client.publish(mqtt_topic_sensor, jsonData.c_str());
      Serial.println("📤 Data: " + jsonData);

      StaticJsonDocument<128> doc;
      if (deserializeJson(doc, jsonData) == DeserializationError::Ok) {
        int garbage_level = doc["garbage_level"];
        int gas = doc["gas"];

        // Báo động tự động bằng loa I2S nếu vượt ngưỡng
        if (garbage_level >= nguongDayRac || gas > nguongGas) {
          if (!rtttl->isRunning() && (millis() - lastAlarmTime > 5000)) {
            triggerSiren(true);
            lastAlarmTime = millis();
          }
        }
      }
    }
  }
}