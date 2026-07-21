#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

const char* ssid = "Tung";
const char* password = "12345678910";

const char* mqtt_server = "test.mosquitto.org";
const int mqtt_port = 1883;
const char* mqtt_topic_sensor = "smarthome/bin/sensor_data";
const char* mqtt_topic_control = "smarthome/bin/control";

WiFiClient espClient;
PubSubClient client(espClient);
SoftwareSerial arduinoSerial(D1, D2); // RX=D1, TX=D2
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
  
  Serial.println(F("====== GATEWAY ESP8266 SẴN SÀNG ====="));
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // Nhận dữ liệu từ Arduino gửi lên
  if (arduinoSerial.available()) {
    String jsonData = arduinoSerial.readStringUntil('\n');
    jsonData.trim();
    
    if (jsonData.length() > 0 && jsonData.startsWith("{") && jsonData.endsWith("}")) {
      client.publish(mqtt_topic_sensor, jsonData.c_str());
    }
  }
}