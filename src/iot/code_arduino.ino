#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <Servo.h> 
#include <SoftwareSerial.h> // Khai báo thư viện giao tiếp ESP8266
#include "DFRobotDFPlayerMini.h" // Thư viện cho DFPlayerMini
#include <EEPROM.h> // Thư viện đọc/ghi bộ nhớ lưu trữ vĩnh viễn EEPROM trên Arduino

// ====== CẤU HÌNH CÁC CHÂN KẾT NỐI (PINS) ======

// --- Chân cảm biến siêu âm đo tay người ---
#define HAND_TRIG_PIN 3     
#define HAND_ECHO_PIN 2     
#define SERVO_PIN 10       // Động cơ Servo MG996R

// --- Chân cảm biến siêu âm đo mức rác ---
#define GARBAGE_TRIG_PIN 9  
#define GARBAGE_ECHO_PIN 8 
#define MQ135_PIN A0        // Chân Analog đọc khí Gas
#define DHTPIN 7            // Chân Digital 7 đọc DHT11

// --- Chân giao tiếp với ESP8266 ---
SoftwareSerial espSerial(11, 12); // (RX, TX) ảo trên UNO

// --- Chân giao tiếp với Loa DFPlayer Mini ---
#define DFPLAYER_RX 4  
#define DFPLAYER_TX 5  
SoftwareSerial dfSerial(DFPLAYER_RX, DFPLAYER_TX);
DFRobotDFPlayerMini myDFPlayer;

// ====== ĐỊNH NGHĨA CÁC THÔNG SỐ ======
#define DHTTYPE DHT11  

// Ngưỡng khoảng cách (cm) để mở nắp tự động
const int NGHUONG_KHOANG_CACH = 15; 

// Góc quay Servo
const int GOC_MO_NAP = 120;   
const int GOC_DONG_NAP = 40;   

// ====== KHỞI TẠO ĐỐI TƯỢNG ======
LiquidCrystal_I2C lcd(0x27, 16, 2); 
DHT dht(DHTPIN, DHTTYPE);
Servo servoNapThung; 

// ====== CẤU HÌNH BIẾN TOÀN CỤC ======
unsigned long handDuration, garbageDuration;
float handDistance, garbageDistance;
int intGarbageLevel;
int intGasValue;
float nhietDo, doAm;

unsigned long lidOpenTimer = 0; // Thêm biến đếm thời gian giữ nắp mở
const unsigned long LID_HOLD_TIME = 3000; // Thời gian giữ nắp mở (3 giây)
String trangThaiLid = "DONG";

bool lastLidState = false; 
bool lastTrashFullState = false; 
bool dfplayerReady = false; // Cờ kiểm tra DFPlayer đã sẵn sàng chưa

// Ký tự độ C đặc biệt hiển thị trên LCD
byte kyTuDoC[8] = {
  B00110, B01001, B01001, B00110,
  B00000, B00000, B00000, B00000
};

// Các biến timer để không làm chậm vòng lặp
unsigned long lastSensorRead = 0;
unsigned long lastDataSend = 0;

// ====== CÁC BIẾN ĐIỀU KHIỂN TỪ XA GHI ĐÈ GIAO DIỆN WEB ======
String manualCommand = "auto"; // "auto", "open", "close"
bool manualAlarm = false;
bool lastManualAlarm = false;

// ====== ĐỊNH NGHĨA STRUCT ĐỂ LƯU CẤU HÌNH VÀO EEPROM VĨNH VIỄN ======
struct ConfigData {
  byte signature;       // Chữ ký xác nhận đã cấu hình (ví dụ 0xAA)
  byte nguongDayRac;    // Ngưỡng đầy rác
  int nguongGas;        // Ngưỡng khí gas (kiểu int chiếm 2 byte)
  byte binHeightVal;    // Chiều cao thùng
  byte volumeVal;       // Âm lượng loa
} myConfig;

// Các biến cấu hình động được gán từ bộ nhớ EEPROM hoặc mặc định
int nguongDayRac;
int nguongGas;
int binHeightVal;
int volumeVal;

void setup() {
  Serial.begin(9600);
  Serial.println("====== KHOI DONG HE THONG THUNG RAC THONG MINH TONG HOP ======");
  
  // --- ĐỌC CẤU HÌNH VĨNH VIỄN TỪ EEPROM ---
  EEPROM.get(0, myConfig);
  if (myConfig.signature != 0xAA) {
    // Nếu chưa từng cấu hình từ Web (chưa có chữ ký 0xAA), thiết lập mặc định
    Serial.println(F("💾 EEPROM trống! Đang thiết lập cấu hình mặc định ban đầu..."));
    myConfig.signature = 0xAA;
    myConfig.nguongDayRac = 80;
    myConfig.nguongGas = 500;
    myConfig.binHeightVal = 25;
    myConfig.volumeVal = 18;
    EEPROM.put(0, myConfig); // Lưu lại cấu hình mặc định vào EEPROM
  } else {
    Serial.println(F("💾 Đã tìm thấy cấu hình cũ lưu trong bộ nhớ EEPROM!"));
  }
  
  // Gán cấu hình động từ struct ra các biến sử dụng trong chương trình
  nguongDayRac = myConfig.nguongDayRac;
  nguongGas = myConfig.nguongGas;
  binHeightVal = myConfig.binHeightVal;
  volumeVal = myConfig.volumeVal;

  Serial.print(F("🔧 Cấu hình hiện tại - Rác: ")); Serial.print(nguongDayRac);
  Serial.print(F("%, Gas: ")); Serial.print(nguongGas);
  Serial.print(F("ppm, Cao: ")); Serial.print(binHeightVal);
  Serial.print(F("cm, Vol: ")); Serial.println(volumeVal);

  espSerial.begin(9600); // Khởi động Serial sang ESP8266
  
  // Khởi động Serial cho DFPlayer Mini
  dfSerial.begin(9600); 
  
  // SoftwareSerial chỉ lắng nghe được 1 cổng tại 1 thời điểm.
  dfSerial.listen(); 
  delay(10);
  if (!myDFPlayer.begin(dfSerial)) {
    Serial.println(F("Khong ket noi duoc DFPlayer! Kiem tra day cam hoac the nho."));
    dfplayerReady = false;
  } else {
    Serial.println(F("DFPlayer da san sang."));
    myDFPlayer.volume(volumeVal);  // Đặt âm lượng lấy từ bộ nhớ EEPROM
    dfplayerReady = true;
  }

  // Chuyển sang lắng nghe tín hiệu điều khiển từ ESP8266
  espSerial.listen();

  // Khởi tạo các chân Cảm biến Siêu âm 1 (Đo tay)
  pinMode(HAND_TRIG_PIN, OUTPUT);
  pinMode(HAND_ECHO_PIN, INPUT);

  // Khởi tạo các chân Cảm biến Siêu âm 2 (Mức rác)
  pinMode(GARBAGE_TRIG_PIN, OUTPUT);
  pinMode(GARBAGE_ECHO_PIN, INPUT);
  
  // Khởi tạo cảm biến MQ-135
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
  // ====== BUOC 0: ĐỌC LỆNH ĐIỀU KHIỂN & CẤU HÌNH TỪ ESP8266 (WEB) ======
  if (espSerial.available()) {
    String cmdLine = espSerial.readStringUntil('\n');
    cmdLine.trim();
    if (cmdLine.startsWith("CMD:")) {
      String command = cmdLine.substring(4);
      Serial.print("Nhan lenh tu ESP: ");
      Serial.println(command);
      
      if (command == "open") {
        manualCommand = "open";
      } else if (command == "close") {
        manualCommand = "close";
      } else if (command == "auto") {
        manualCommand = "auto";
      } else if (command == "play_alarm") {
        manualAlarm = true;
      } else if (command == "stop_alarm") {
        manualAlarm = false;
      } 
      
      // XỬ LÝ LỆNH CẤU HÌNH ĐỘNG TỪ WEB VÀ LƯU VÀO EEPROM: config:trash:gas:height:vol
      else if (command.startsWith("config:")) {
        char tempBuf[40];
        command.toCharArray(tempBuf, 40);
        int trash, gas, height, vol;
        if (sscanf(tempBuf, "config:%d:%d:%d:%d", &trash, &gas, &height, &vol) == 4) {
          nguongDayRac = trash;
          nguongGas = gas;
          binHeightVal = height;
          volumeVal = vol;
          
          // Ghi đè cấu hình mới vào struct
          myConfig.nguongDayRac = nguongDayRac;
          myConfig.nguongGas = nguongGas;
          myConfig.binHeightVal = binHeightVal;
          myConfig.volumeVal = volumeVal;
          
          // Ghi cấu hình mới vĩnh viễn vào bộ nhớ EEPROM
          EEPROM.put(0, myConfig); 
          Serial.println(F("💾 Đã lưu cấu hình mới vĩnh viễn vào EEPROM!"));

          // Cập nhật ngay lập tức âm lượng sang DFPlayer Mini
          dfSerial.listen();
          delay(10);
          myDFPlayer.volume(volumeVal);
          delay(10);
          espSerial.listen(); // Trả lại quyền lắng nghe lệnh cho ESP8266
        }
      }
    }
  }

  // ====== BUOC 1: ĐỌC DỮ LIỆU CẢM BIẾN MÔI TRƯỜNG (2 GIÂY/LẦN) ======
  if (millis() - lastSensorRead >= 2000 || lastSensorRead == 0) {
    // 1.1 Đọc DHT11
    float tempNhietDo = dht.readTemperature();
    float tempDoAm = dht.readHumidity();
    
    if (isnan(tempDoAm) || isnan(tempNhietDo)) {
      Serial.println("Loi: Khong doc duoc tu DHT11!");
    } else {
      nhietDo = tempNhietDo;
      doAm = tempDoAm;
    }
    
    // 1.2 Đọc MQ-135 Khí Gas
    intGasValue = analogRead(MQ135_PIN);
    lastSensorRead = millis();
  }

  // ====== BUOC 2: ĐO KHOẢNG CÁCH TAY VÀ ĐIỀU KHIỂN NẮP ======
  digitalWrite(HAND_TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(HAND_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(HAND_TRIG_PIN, LOW);
  
  handDuration = pulseIn(HAND_ECHO_PIN, HIGH, 30000); 
  handDistance = handDuration * 0.034 / 2;

  // Quyết định trạng thái nắp (Hỗ trợ ghi đè thủ công từ Web)
  bool shouldOpen = false;
  if (manualCommand == "open") {
    shouldOpen = true;
  } else if (manualCommand == "close") {
    shouldOpen = false;
  } else {
    // Chế độ tự động: Có tay thì mở và cập nhật mốc thời gian
    if (handDistance > 0 && handDistance < NGHUONG_KHOANG_CACH) {
      shouldOpen = true;
      lidOpenTimer = millis(); // Ghi nhớ thời điểm cuối cùng nhìn thấy tay
    } 
    // Nếu không thấy tay, nhưng chưa hết 3 giây chờ -> vẫn giữ mở
    else if (millis() - lidOpenTimer < LID_HOLD_TIME) {
      shouldOpen = true;
    } 
    // Hết thời gian chờ -> đóng nắp
    else {
      shouldOpen = false;
    }
  }

  // Điều khiển Servo và cập nhật trạng thái
  if (shouldOpen) {
    servoNapThung.write(GOC_MO_NAP);
    trangThaiLid = "MO "; 
  } else {
    servoNapThung.write(GOC_DONG_NAP);
    trangThaiLid = "DONG";
  }

  // ====== BUOC 3: ĐO MỨC RÁC HIỆN TẠI (DÙNG CHIỀU CAO THÙNG CẤU HÌNH ĐỘNG) ======
  digitalWrite(GARBAGE_TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(GARBAGE_TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(GARBAGE_TRIG_PIN, LOW);

  garbageDuration = pulseIn(GARBAGE_ECHO_PIN, HIGH, 30000);
  garbageDistance = garbageDuration * 0.034 / 2;
  
  // Sử dụng biến binHeightVal thay vì hằng số cố định BIN_HEIGHT
  intGarbageLevel = map(garbageDistance, binHeightVal, 5, 0, 100);
  intGarbageLevel = constrain(intGarbageLevel, 0, 100); 

  // ====== BUOC 3.5: ĐIỀU KHIỂN LOA DFPLAYER ======
  bool currentTrashFull = (intGarbageLevel >= nguongDayRac);

  // 3.5.1 Lệnh còi hú từ giao diện Web ghi đè
  if (dfplayerReady && (manualAlarm != lastManualAlarm)) {
    dfSerial.listen();
    delay(10);
    if (manualAlarm) {
      Serial.println(F("🔊 [LOA BÁO ĐỘNG] -> Kích hoạt từ Web! Vòng lặp Bài 1..."));
      myDFPlayer.loop(1);
    } else {
      Serial.println(F("🔇 [LOA BÁO ĐỘNG] -> Tắt còi báo động từ Web!"));
      myDFPlayer.stop();
    }
    delay(10);
    espSerial.listen(); // Trả lại quyền nghe lệnh cho ESP
    lastManualAlarm = manualAlarm;
  } else if (!dfplayerReady) {
    lastManualAlarm = manualAlarm; // Cập nhật trạng thái để tránh lặp
  }

  // 3.5.2 Chế độ tự động phát âm thanh khi còi hú tắt
  if (dfplayerReady && !manualAlarm) {
    // Trạng thái nắp thay đổi (Mở hoặc Đóng)
    if (shouldOpen != lastLidState) {
      dfSerial.listen();
      delay(10);
      if (shouldOpen) {
        if (currentTrashFull) {
          Serial.println(F("🔊 [LOA] -> Thung rac DAY! Phat canh bao (Bai 4)..."));
          myDFPlayer.play(4);
        } else {
          Serial.println(F("🔊 [LOA] -> Nap MO! Xin moi ban bo rac (Bai 2)..."));
          myDFPlayer.play(2);
        }
      } else {
        Serial.println(F("🔊 [LOA] -> Nap DONG! Xin cam on da bo rac (Bai 3)."));
        myDFPlayer.play(3);
      }
      delay(10);
      espSerial.listen(); // Trả lại quyền nghe lệnh cho ESP
      lastLidState = shouldOpen;
    }

    // Phát cảnh báo khi thùng rác vừa đầy lúc nắp đang đóng (phát 1 lần cảnh báo)
    if (currentTrashFull != lastTrashFullState) {
      if (currentTrashFull && !shouldOpen) {
        dfSerial.listen();
        delay(10);
        Serial.println(F("🔊 [LOA] -> Thung rac VUA DAY! Phat canh bao mot lan (Bai 4)..."));
        myDFPlayer.play(4);
        delay(10);
        espSerial.listen(); // Trả lại quyền nghe lệnh cho ESP
      }
      lastTrashFullState = currentTrashFull;
    }
  } else if (!dfplayerReady) {
    // Nếu không cắm loa, chỉ in log debug chứ không gọi lệnh âm thanh
    if (shouldOpen != lastLidState) {
      if (shouldOpen) {
        Serial.println(F("⚠️ [DEBUG LOA] -> Nap MO (Bỏ qua phát nhạc vì chưa cắm loa)"));
      } else {
        Serial.println(F("⚠️ [DEBUG LOA] -> Nap DONG (Bỏ qua phát nhạc vì chưa cắm loa)"));
      }
      lastLidState = shouldOpen;
    }
    lastTrashFullState = currentTrashFull;
  }

  // ====== BUOC 4 & 5: HIỂN THỊ LCD VÀ GỬI JSON (1 GIÂY/LẦN) ======
  if (millis() - lastDataSend >= 1000 || lastDataSend == 0) {
    // Hàng 1: T:xx*C H:xx% G:xxxx
    lcd.setCursor(0, 0);
    lcd.print("T:");
    lcd.print((int)nhietDo);
    lcd.write(0); 
    lcd.print("C H:");
    lcd.print((int)doAm);
    lcd.print("% G:");
    lcd.print(intGasValue); 
    lcd.print("   "); 

    // Hàng 2: Lid:DONG Rac:xxx%
    lcd.setCursor(0, 1);
    lcd.print("Lid:");
    lcd.print(trangThaiLid);
    lcd.setCursor(8, 1); 
    lcd.print("Rac:");
    lcd.print(intGarbageLevel);
    lcd.print("%  "); 

    // Gom dữ liệu vào JSON
    String jsonData = "{";
    jsonData += "\"garbage_level\":" + String(intGarbageLevel) + ",";
    jsonData += "\"gas\":" + String(intGasValue) + ","; 
    jsonData += "\"humidity\":" + String((int)doAm) + ",";
    jsonData += "\"temperature\":" + String((int)nhietDo) + ","; 
    jsonData += "\"is_lid_open\":" + String(shouldOpen ? "true" : "false");
    jsonData += "}";

    // Gửi dữ liệu qua Serial ảo sang ESP8266
    espSerial.println(jsonData);

    // DEBUG PRINT RA CỔNG SERIAL MÁY TÍNH
    Serial.print("HandDist:"); Serial.print(handDistance); Serial.print("cm | ");
    Serial.print("Mode:"); Serial.print(manualCommand); Serial.print(" | ");
    Serial.print(" Rac:"); Serial.print(intGarbageLevel); Serial.print("% | ");
    Serial.print(" Gas:"); Serial.print(intGasValue); Serial.print(" | ");
    Serial.print(" Json:"); Serial.println(jsonData);

    lastDataSend = millis();
  }

  // ====== TRỄ NGẮN ĐỂ TRÁNH QUÁ TẢI CPU ======
  delay(30); 
}