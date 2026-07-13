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

const http = require("http");

// Hàm truy vấn lịch sử rác theo một ngày cụ thể (YYYY-MM-DD) từ SQL Server
async function getHistoryByDate(dateStr) {
  if (!pool) {
    throw new Error("Chưa kết nối Database");
  }
  try {
    const result = await pool.request()
      .input("date", sql.VarChar, dateStr)
      .query(`
        SELECT timestamp, garbage_level
        FROM GarbageHistory
        WHERE CONVERT(DATE, timestamp) = @date
        ORDER BY timestamp ASC
      `);

    const records = result.recordset;
    if (records.length === 0) return [];
    
    // Thu thập tối đa khoảng 50 điểm trải đều trong ngày
    const maxPoints = 50;
    const step = Math.max(1, Math.floor(records.length / maxPoints));
    const history = [];
    
    for (let i = 0; i < records.length; i += step) {
      const row = records[i];
      const timeStr = new Date(row.timestamp).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
      });
      history.push({
        time: timeStr,
        actual: Math.round(row.garbage_level),
        prediction: null
      });
    }
    return history;
  } catch (err) {
    console.error("Lỗi khi truy vấn lịch sử theo ngày:", err);
    throw err;
  }
}

// Khởi tạo HTTP Server để xử lý API tìm kiếm lịch sử
const server = http.createServer(async (req, res) => {
  // Cấu hình CORS để React chạy cổng 5173 truy cập được
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Phân tích đường dẫn API
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  
  if (parsedUrl.pathname === "/api/history") {
    const dateStr = parsedUrl.searchParams.get("date"); // Định dạng "YYYY-MM-DD"
    if (!dateStr) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Thiếu tham số date" }));
      return;
    }

    try {
      const history = await getHistoryByDate(dateStr);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(history));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(404);
    res.end("API Not Found");
  }
});

// WebSocket Server để mobile app kết nối (chạy chung cổng 3001 thông qua HTTP Server)
const wss = new WebSocket.Server({ server });
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

  server.listen(3001, () => {
    console.log("🚀 Backend Server (HTTP + WS) đang chạy trên cổng 3001");
  });

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
