require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./passport");
const authRouter = require("./routes/auth");
const itemRouter = require("./routes/item");
const orderRouter = require("./routes/order");
const scheduleRouter = require("./routes/schedule");
const trackingRouter = require("./routes/tracking");
const { sequelize } = require("./models");
const path = require("path");
const app = express();
passportConfig();
sequelize
  .sync({ force: false, alter: true })
  .then(() => {
    console.log("data base연결됨.");
  })
  .catch((e) => {
    console.error("데이터베이스 동기화 에러:", e);
  });
app.set("port", process.env.PORT || 4000);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: { httpOnly: true, secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", authRouter);
app.use("/item", itemRouter);
app.use("/order", orderRouter);
app.use("/schedule", scheduleRouter);
app.use("/tracking", trackingRouter);

// Health Check API
app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: "healthy", database: "connected", timestamp: new Date() });
  } catch (error) {
    res.status(503).json({ status: "unhealthy", database: "disconnected", error: error.message });
  }
});

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `요청하신 경로를 찾을 수 없습니다: ${req.method} ${req.originalUrl}`,
    code: "NOT_FOUND",
  });
});

// Central Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    message: isProd && statusCode === 500 ? "일시적인 서버 장애가 발생했습니다." : (err.message || "서버 내부 오류가 발생했습니다."),
    code: err.code || "INTERNAL_SERVER_ERROR",
  });
});

app.listen(app.get("port"), () => {
  console.log(`${app.get("port")}번 포트에서 서버 대기 중`);
});
