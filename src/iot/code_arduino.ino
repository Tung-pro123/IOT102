#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <Servo.h> 
#include <SoftwareSerial.h> // Khai báo thư viện giao tiếp ESP8266
#include "DFRobotDFPlayerMini.h" // Thư viện cho DFPlayerMini// ====== CẤU HÌNH CÁC CHÂN KẾT NỐI (PINS) ======

// --- Chân từ Code của Bạn của bạn (Chức năng đóng/mở nắp) ---
#define HAND_TRIG_PIN 3     // Cảm biến siêu âm đo tay người (Code của bạn)
#define HAND_ECHO_PIN 2     
#define SERVO_PIN 10       // Động cơ MG996R (Code của bạn)

// --- Chân từ Code của Bạn (Chức năng đo mức rác & môi trường) ---
#define GARBAGE_TRIG_PIN 9  // Cảm biến siêu âm đo mức rác (Code bạn)
#define GARBAGE_ECHO_PIN 8 
#define MQ135_PIN A0        // Chân Analog đọc khí Gas (Code bạn)
#define DHTPIN 7            // Chân Digital 7 đọc DHT11 (Cả 2 dùng chung chân 7, giữ nguyên)

// --- Chân giao tiếp với ESP8266 (Từ code của bạn) ---
// Chú ý: Dựa trên code của bạn, RX=11, TX=12. 
// Đảm bảo dây cắm: Chân 11(TX_UNO) nối sang RX_ESP, 12(RX_UNO) nối sang TX_ESP.
SoftwareSerial espSerial(11, 12); // (RX, TX) ảo trên UNO

// --- Chân giao tiếp với Loa DFPlayer Mini ---
// Chúng ta sẽ dùng chân 4 và 5 vì các chân khác đã kín.
#define DFPLAYER_RX 4  // Chân 4 nối với TX của DFPlayer
#define DFPLAYER_TX 5  // Chân 5 nối với RX của DFPlayer
SoftwareSerial dfSerial(DFPLAYER_RX, DFPLAYER_TX);
DFRobotDFPlayerMini myDFPlayer;

// ====== ĐỊNH NGHĨA CÁC THÔNG SỐ ======
#define DHTTYPE DHT11  

// Ngưỡng khoảng cách (cm) để mở nắp (Từ Code của bạn)
const int NGHUONG_KHOANG_CACH = 15; 

// Góc quay Servo (Đã chỉnh lại để chống kẹt bánh răng)
const int GOC_MO_NAP = 150;   
const int GOC_DONG_NAP = 20;   

// Chiều cao thùng (cm) để tính phần trăm rác (Từ Code của bạn)
const int BIN_HEIGHT = 25;

// ====== KHỞI TẠO ĐỐI TƯỢNG (OBJECTS) ======
LiquidCrystal_I2C lcd(0x27, 16, 2); 
DHT dht(DHTPIN, DHTTYPE);
Servo servoNapThung; 

// ====== CẤU HÌNH BIẾN TOÀN CỤC ======
float nhietDo = 0.0;
float doAm = 0.0;
int intGasValue = 0; 

long handDuration = 0;
float handDistance = 0.0; // Khoảng cách tay để mở nắp (Code của bạn)
String trangThaiLid = "DONG";

long garbageDuration = 0;
int garbageDistance = 0; // Khoảng cách từ cảm biến mức rác xuống (Code bạn)
int intGarbageLevel = 0; // Phần trăm rác tính được

// Ký tự độ C đặc biệt hiển thị trên LCD
byte kyTuDoC[8] = {
  B00110, B01001, B01001, B00110,
  B00000, B00000, B00000, B00000
};

// Các biến timer để không làm chậm vòng lặp
unsigned long lastSensorRead = 0;
unsigned long lastDataSend = 0;

void setup() {
  Serial.begin(9600);
  Serial.println("====== KHOI DONG HE THONG THUNG RAC THONG MINH TONG HOP ======");
  
  espSerial.begin(9600); // Khởi động Serial sang ESP8266
  
  // Khởi động Serial cho DFPlayer Mini
  dfSerial.begin(9600); 

  // Lưu ý: SoftwareSerial chỉ lắng nghe được 1 cổng tại 1 thời điểm.
  // Ta gọi dfSerial.listen() để DFPlayer có thể báo cáo trạng thái lúc khởi động.
  dfSerial.listen(); 
  if (!myDFPlayer.begin(dfSerial)) {
    Serial.println(F("Khong ket noi duoc DFPlayer! Kiem tra day cam hoac the nho."));
  } else {
    Serial.println(F("DFPlayer da san sang."));
    myDFPlayer.volume(30);  // Đặt âm lượng (0 - 30)
    myDFPlayer.loop(1);     // Phát vòng lặp bài số 1 liên tục
  }

  // Khởi tạo các chân Cảm biến Siêu âm 1 (Đo tay)
  pinMode(HAND_TRIG_PIN, OUTPUT);
  pinMode(HAND_ECHO_PIN, INPUT);

  // Khởi tạo các chân Cảm biến Siêu âm 2 (Mức rác - Code bạn)
  pinMode(GARBAGE_TRIG_PIN, OUTPUT);
  pinMode(GARBAGE_ECHO_PIN, INPUT);
  
  // Khởi tạo cảm biến MQ-135 (Code bạn)
  pinMode(MQ135_PIN, INPUT);

  // Khởi tạo cảm biến DHT11
  dht.begin();

  // Khởi tạo và đưa Servo về trạng thái đóng ban đầu
  servoNapThung.attach(SERVO_PIN);
  servoNapThung.write(GOC_DONG_NAP);

  // Khởi tạo màn hình LCD
  lcd.init();
  lcd.backlight(); 
  
  // Đăng ký ký tự đặc biệt biểu tượng độ C vào vị trí số 0
  lcd.createChar(0, kyTuDoC);

  // Màn hình chào mừng lúc khởi động
  lcd.setCursor(0, 0);
  lcd.print("HE THONG IOT ALL");
  lcd.setCursor(0, 1);
  lcd.print("Smart Bin Init..");
  delay(2000);
  lcd.clear();
}

void loop() {
  // ====== BUOC 1: ĐỌC DỮ LIỆU CẢM BIẾN MÔI TRƯỜNG (2 GIÂY/LẦN) ======
  if (millis() - lastSensorRead >= 2000 || lastSensorRead == 0) {
    // 1.1 Đọc DHT11
    float tempNhietDo = dht.readTemperature();
    float tempDoAm = dht.readHumidity();
    
    // Kiểm tra nếu lỗi đọc DHT11
    if (isnan(tempDoAm) || isnan(tempNhietDo)) {
      Serial.println("Lỗi: Không đọc được datos từ DHT11! Đưa về giá trị 0.");
      // Giữ nguyên giá trị cũ nếu lỗi, hoặc reset về 0 tùy bạn
    } else {
      nhietDo = tempNhietDo;
      doAm = tempDoAm;
    }
    
    // 1.2 Đọc MQ-135 Khí Gas
    intGasValue = analogRead(MQ135_PIN);
    
    lastSensorRead = millis();
  }

  // ====== BUOC 2: ĐO KHOẢNG CÁCH TAY VÀ ĐIỀU KHIỂN NẮP (LOGIC BẠN BẠN) ======
  
  digitalWrite(HAND_TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(HAND_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(HAND_TRIG_PIN, LOW);
  
  // Dùng timeout pulseIn() ngắn để tránh lag vòng loop (30ms)
  handDuration = pulseIn(HAND_ECHO_PIN, HIGH, 30000); 
  handDistance = handDuration * 0.034 / 2;

  // Điều khiển Servo và cập nhật trạng thái
  if (handDistance > 0 && handDistance < NGHUONG_KHOANG_CACH) {
    servoNapThung.write(GOC_MO_NAP);
    trangThaiLid = "MO "; // Thêm khoảng trắng để xóa chữ "D" cũ
  } else {
    servoNapThung.write(GOC_DONG_NAP);
    trangThaiLid = "DONG";
  }

  // ====== BUOC 3: ĐO MỨC RÁC HIỆN TẠI (LOGIC CODE BẠN) ======
  
  digitalWrite(GARBAGE_TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(GARBAGE_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(GARBAGE_TRIG_PIN, LOW);

  // Dùng pulseIn() có timeout (30ms)
  garbageDuration = pulseIn(GARBAGE_ECHO_PIN, HIGH, 30000);
  garbageDistance = garbageDuration * 0.034 / 2;
  
  // Tính toán mức phần trăm rác (%) (Code bạn)
  intGarbageLevel = map(garbageDistance, BIN_HEIGHT, 5, 0, 100);
  intGarbageLevel = constrain(intGarbageLevel, 0, 100); // Ép trong khoảng 0-100%

  // ====== BUOC 4 & 5: HIỂN THỊ LCD VÀ GỬI JSON (1 GIÂY/LẦN) ======
  if (millis() - lastDataSend >= 1000 || lastDataSend == 0) {
    // Hàng 1: T:xx*C H:xx% G:xxxx
    lcd.setCursor(0, 0);
    lcd.print("T:");
    lcd.print((int)nhietDo);
    lcd.write(0); // Biểu tượng độ C đặc biệt
    lcd.print("C H:");
    lcd.print((int)doAm);
    lcd.print("% G:");
    lcd.print(intGasValue); 
    lcd.print("   "); // Xóa ký tự thừa nếu số giảm nhanh

    // Hàng 2: Lid:DONG Rac:xxx%
    lcd.setCursor(0, 1);
    lcd.print("Lid:");
    lcd.print(trangThaiLid);
    lcd.setCursor(8, 1); // Đặt con trỏ sang ô thứ 8
    lcd.print("Rac:");
    lcd.print(intGarbageLevel);
    lcd.print("%  "); // Xóa ký tự thừa

    // Gom dữ liệu vào JSON
    String jsonData = "{";
    jsonData += "\"garbage_level\":" + String(intGarbageLevel) + ",";
    jsonData += "\"gas\":" + String(intGasValue) + ","; 
    jsonData += "\"humidity\":" + String((int)doAm) + ",";
    jsonData += "\"temperature\":" + String((int)nhietDo) + ","; 
    jsonData += "\"is_lid_open\":" + String((handDistance > 0 && handDistance < NGHUONG_KHOANG_CACH) ? "true" : "false");
    jsonData += "}";

    // Gửi dữ liệu qua Serial ảo sang ESP8266
    espSerial.println(jsonData);

    // DEBUG PRINT RA CỔNG SERIAL MÁY TÍNH
    Serial.print("HandDist:"); Serial.print(handDistance); Serial.print("cm | ");
    Serial.print(" Rac:"); Serial.print(intGarbageLevel); Serial.print("% | ");
    Serial.print(" Gas:"); Serial.print(intGasValue); Serial.print(" | ");
    Serial.print(" Json:"); Serial.println(jsonData);

    lastDataSend = millis();
  }

  // ====== TRỄ NGẮN ĐỂ TRÁNH QUÁ TẢI CPU ======
  delay(30); 
}