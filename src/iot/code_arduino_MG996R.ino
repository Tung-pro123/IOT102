#include <SoftwareSerial.h>
#include "DFRobotDFPlayerMini.h"
#include <Servo.h>

// --- CẤU HÌNH CÁC CHÂN KẾT NỐI (PINS) ---
#define SERVO_PIN 10
#define DFPLAYER_RX 4  // Chân 4 Arduino nối với TX của DFPlayer
#define DFPLAYER_TX 5  // Chân 5 Arduino nối với RX của DFPlayer

SoftwareSerial dfSerial(DFPLAYER_RX, DFPLAYER_TX);
DFRobotDFPlayerMini myDFPlayer;
Servo myServo;

// Biến điều khiển xoay Servo liên tục
unsigned long lastServoAction = 0;
const unsigned long servoInterval = 1000; // Xoay servo mỗi 1.0 giây để test tải liên tục
bool isLidOpen = false;

void setup() {
  Serial.begin(9600);
  Serial.println("=== KHOI DONG STRESS-TEST SERVO & LOA ===");

  // 1. Khởi tạo Servo
  myServo.attach(SERVO_PIN);
  myServo.write(20); // Góc đóng ban đầu
  Serial.println("1. Servo da attach va ghi goc 20 do.");

  // 2. Khởi tạo DFPlayer
  dfSerial.begin(9600);
  
  Serial.println("2. Dang ket noi voi DFPlayer...");
  if (!myDFPlayer.begin(dfSerial)) {
    Serial.println("❌ Khong ket noi duoc DFPlayer (Kiem tra nguon/the nho/RX-TX).");
  } else {
    Serial.println("✅ DFPlayer ket noi thanh cong!");
    myDFPlayer.volume(18); // Âm lượng an toàn (15-20) cho loa 3 Ohm 8W
    delay(100);            // Chờ một chút để lệnh volume được thực thi ổn định
    myDFPlayer.loop(1);    // Phát nhạc lặp lại liên tục bài số 1
    Serial.println("3. Nhac bat dau phat.");
  }

  Serial.println("🚀 Bat dau chay vong lap loop() - Servo se quay lien tuc!");
}

void loop() {
  // LƯU Ý: Đã bỏ hoàn toàn các hàm check thư viện DFPlayer trong loop để tránh bị nghẽn (blocking).
  // Vòng lặp loop lúc này chạy cực kỳ nhẹ và tập trung hoàn toàn vào việc quét Servo.

  if (millis() - lastServoAction >= servoInterval) {
    if (isLidOpen) {
      Serial.println("🤖 [SERVO] -> DONG NAP (40 do)");
      myServo.write(40);
      isLidOpen = false;
    } else {
      Serial.println("🤖 [SERVO] -> MO NAP (120 do)");
      myServo.write(120);
      isLidOpen = true;
    }
    lastServoAction = millis();
  }
}
