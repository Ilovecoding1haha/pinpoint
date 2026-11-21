const WEBHOOK = "/api/alert";
const $ = (id) => document.getElementById(id);
const log = (m, cls = "") => {
  const l = $("log");
  const line = document.createElement("div");
  line.className = cls;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${m}`;
  l.appendChild(line);
  l.scrollTop = l.scrollHeight;
};
const setStatus = (t, ok = false) => {
  $("statusText").textContent = t;
  $("status").classList.toggle("ok", ok);
};

let coords = null;
let address = "";
let fingerprint = "";
let state = "idle";

function buildFingerprint() {
  const parts = [
    navigator.userAgent, navigator.language,
    screen.width + "x" + screen.height, screen.colorDepth,
    new Date().getTimezoneOffset(), navigator.hardwareConcurrency, navigator.platform
  ].join("|");
  let h = 0;
  for (let i = 0; i < parts.length; i++) h = (h * 31 + parts.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).padStart(8, "0").toUpperCase();
}

async function getIp() {
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const j = await r.json();
    $("dIp").textContent = j.ip;
    return j.ip;
  } catch { $("dIp").textContent = "unavailable"; return null; }
}

async function reverseGeo(lat, lon) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const j = await r.json();
    address = j.display_name || "";
    $("dAddr").textContent = address || "unresolved";
  } catch { $("dAddr").textContent = "unresolved"; }
}

// dept chips
const depts = ["NYPD","LAPD","CPD","SFPD","MDPD","BPD","PPD","HPD","DPD","APD","SPD","MPD","Philly PD","Bexar SO","Clark SO"];
$("deptlist").innerHTML = depts.map(d => `<span class="dept">\${d}</span>`).join("");

// arm
\$("armBtn").addEventListener("click", () => {
  if (!navigator.geolocation) { log("Geolocation unsupported", "err"); return; }
  \$("armBtn").disabled = true;
  setStatus("Acquiring GPS lock…");
  log("Requesting location permission", "warn");

  navigator.geolocation.getCurrentPosition(async (pos) => {
   
