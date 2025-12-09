const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy so we can get real client IP when behind nginx / cloud
app.set("trust proxy", true);

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

// ---------- /ip : just IP ----------
app.get("/ip", (req, res) => {
  const ip = getClientIp(req);
  res.json({ ip });
});

// ---------- /geo : IP + location ----------
app.get("/geo", async (req, res) => {
  const ip = getClientIp(req);

  if (!ip) {
    return res.status(400).json({ error: "Could not determine client IP" });
  }

  try {
    // use ip-api.com (free, no auth for basic use)
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();

    if (data.status !== "success") {
      return res.status(500).json({
        ip,
        error: "Geo lookup failed",
        raw: data,
      });
    }

    return res.json({
      ip,
      location: {
        country: data.country,
        countryCode: data.countryCode,
        region: data.regionName,
        city: data.city,
        lat: data.lat,
        lon: data.lon,
        timezone: data.timezone,
        isp: data.isp,
      },
    });
  } catch (err) {
    console.error("Geo error:", err);
    return res.status(500).json({ ip, error: "Geo service error" });
  }
});

// Root (info)
app.get("/", (req, res) => {
  res.send("IP Echo API. Use /ip for IP, /geo for IP + location.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});