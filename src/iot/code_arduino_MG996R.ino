#include <Servo.h> 
#include <SoftwareSerial.h>
#include "DFRobotDFPlayerMini.h"

// --- CẤU HÌNH SERVO ---
#define SERVO_PIN 10       // Chân điều khiển động cơ Servo MG996R
const int GOC_MO = 150;    // Góc mở nắp
const int GOC_DONG = 20;   // Góc đóng nắp

Servo servoNapThung; 

// --- CẤU HÌNH DFPLAYER MINI ---
#define DFPLAYER_RX 4  // Chân 4 Arduino nối với TX của DFPlayer
#define DFPLAYER_TX 5  // Chân 5 Arduino nối với RX của DFPlayer
SoftwareSerial dfSerial(DFPLAYER_RX, DFPLAYER_TX);
DFRobotDFPlayerMini myDFPlayer;

void setup() {
  Serial.begin(9600);
  Serial.println("=== BAT DAU TEST SERVO VA DFPLAYER MINI ===");

  // 1. Khởi tạo Servo
  servoNapThung.attach(SERVO_PIN);
  
  // 2. Khởi tạo DFPlayer
  dfSerial.begin(9600);
  dfSerial.listen();
  
  if (!myDFPlayer.begin(dfSerial)) {
    Serial.println("Khong ket noi duoc DFPlayer! Vui long kiem tra lai day cam.");
  } else {
    Serial.println("DFPlayer da san sang.");
    myDFPlayer.volume(30); // Đặt âm lượng lớn nhất (0-30)
    
    // Phát bài hát số 1 và lặp lại liên tục
    myDFPlayer.loop(1); 
  }
}

void loop() {
  // DFPlayer đã tự động phát nhạc ở background nhờ lệnh myDFPlayer.loop(1) trong setup()
  // Trong vòng lặp chỉ cần test xoay Servo lên xuống
  
  // Quay về góc đóng
  Serial.println("Dang quay ve goc DONG (20 do)...");
  servoNapThung.write(GOC_DONG);
  delay(2000); // Đợi 2 giây 

  // Quay về góc mở
  Serial.println("Dang quay ve goc MO (150 do)...");
  servoNapThung.write(GOC_MO);
  delay(2000); // Đợi 2 giây
}
