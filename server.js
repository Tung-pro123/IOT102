const mqtt = require("mqtt");
const sql = require("mssql");
const WebSocket = require("ws");

// Cấu hình Database
const dbConfig = {
  user: "sa",
  password: "12345",
  server: "localhost",
  database: "SmartWasteDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// Cấu hình MQTT
const brokerUrl = "mqtt://test.mosquitto.org";
const sensorTopic = "smarthome/bin/sensor_data";
const predictionTopic = "smarthome/bin/prediction";

let pool;

// WebSocket Server để mobile app kết nối
const wss = new WebSocket.Server({ port: 3001 });
let wsClients = new Set();

wss.on("connection", (ws) => {
  console.log("📱 Mobile app đã kết nối qua WebSocket");
  wsClients.add(ws);

  ws.on("close", () => {
    console.log("📱 Mobile app ngắt kết nối");
    wsClients.delete(ws);
  });

  ws.on("error", (err) => {
    wsClients.delete(ws);
  });
});

// Hàm phát dữ liệu tới tất cả mobile clients
function broadcastToMobile(topic, data) {
  const payload = JSON.stringify({ topic, data });
  wsClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

console.log("✅ WebSocket server đang chạy tại cổng 3001 (dành cho Mobile App)");

async function setupDatabase() {
  try {
    console.log("Đang kết nối tới SQL Server để kiểm tra Database...");
    const masterConfig = { ...dbConfig, database: "master" };
    const masterPool = await sql.connect(masterConfig);
    
    const dbCheck = await masterPool.request().query(`
      SELECT name FROM master.dbo.sysdatabases WHERE name = N'SmartWasteDB'
    `);
    
    if (dbCheck.recordset.length === 0) {
      console.log("Chưa có SmartWasteDB, đang tiến hành tạo mới...");
      await masterPool.request().query(`CREATE DATABASE SmartWasteDB`);
      console.log("✅ Đã tạo database SmartWasteDB.");
    }
    await masterPool.close();

    pool = await sql.connect(dbConfig);
    console.log("✅ Đã kết nối thành công tới SmartWasteDB.");

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='GarbageHistory' AND xtype='U')
      CREATE TABLE GarbageHistory (
        id INT IDENTITY(1,1) PRIMARY KEY,
        timestamp DATETIME DEFAULT GETDATE(),
        garbage_level FLOAT
      )
    `);
    console.log("✅ Đã kiểm tra/tạo bảng GarbageHistory.");
  } catch (err) {
    console.error("❌ Lỗi kết nối SQL Server:", err.message);
    console.log("⚠️ Ứng dụng vẫn chạy MQTT nhưng sẽ không lưu được vào DB.");
  }
}

async function startApp() {
  await setupDatabase();

  console.log("Đang kết nối tới MQTT Broker...");
  const client = mqtt.connect(brokerUrl);

  client.on("connect", () => {
    console.log("✅ Kết nối MQTT thành công! Đang lắng nghe dữ liệu thùng rác...");
    client.subscribe(sensorTopic);
    client.subscribe(predictionTopic);
  });

  client.on("message", async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());

      // Phát tới mobile app qua WebSocket
      broadcastToMobile(topic, data);

      if (topic === sensorTopic) {
        console.log(`\n📥 [DỮ LIỆU MỚI]: Mức rác: ${data.garbage_level}%`);

        if (pool && data.garbage_level !== undefined) {
          await pool.request()
            .input("garbage_level", sql.Float, data.garbage_level)
            .query(`INSERT INTO GarbageHistory (garbage_level) VALUES (@garbage_level)`);
          console.log(`💾 Đã lưu mức rác ${data.garbage_level}% vào Database.`);
        }
      } else if (topic === predictionTopic) {
        console.log(`🤖 [DỰ ĐOÁN]: ${data.prediction || ""} | Peak: ${data.peak_time || ""}`);
      }
    } catch (error) {
      console.error("❌ Lỗi khi xử lý dữ liệu:", error.message);
    }
  });
}

startApp();
