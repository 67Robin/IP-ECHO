const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// if later you put this behind a proxy (nginx, cloud, etc)
app.set("trust proxy", true);

// helper to get client IP
function getClientIp(req) {
  const xf = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();

  return (
    xf ||
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.ip ||
    req.socket?.remoteAddress ||
    null
  );
}

//  this is the route you are curling: /ip
app.get("/ip", (req, res) => {
  const ip = getClientIp(req);
  res.json({ ip });
});

// Optional root route so http://localhost:3000 works too
app.get("/", (req, res) => {
  res.send("IP Echo API is running. Use /ip to get your IP.");
});

app.listen(PORT, () => {
  console.log(`IP Echo API running on port ${PORT}`);
});
