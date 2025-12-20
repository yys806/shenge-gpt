const STORAGE_KEY = "nexus_memory_v1";
const AI_ENDPOINT_KEY = "nexus_ai_endpoint";
const AI_KEY_KEY = "nexus_ai_key";
const AI_MODEL_KEY = "nexus_ai_model";
const AI_SYSTEM_PROMPT =
  "You are JARVIS, a helpful AI assistant for a student at Tongji University. Keep responses concise, cool, and tech-focused.";

const memoryInput = document.getElementById("memoryInput");
const addMemoryBtn = document.getElementById("addMemory");
const memoryGrid = document.getElementById("memoryGrid");
const toast = document.getElementById("toast");

const injectFile = document.getElementById("injectFile");
const injectClear = document.getElementById("injectClear");
const injectBtn = document.getElementById("injectBtn");
const injectPreview = document.getElementById("injectPreview");
const injectCapacity = document.getElementById("injectCapacity");
const secretInput = document.getElementById("secretInput");
const downloadLink = document.getElementById("downloadLink");

const extractFile = document.getElementById("extractFile");
const extractClear = document.getElementById("extractClear");
const extractOutput = document.getElementById("extractOutput");

const panelTabs = document.querySelectorAll(".panel-tab");
const cipherPanel = document.getElementById("cipherPanel");
const transmutePanel = document.getElementById("transmutePanel");
const transmuteInput = document.getElementById("transmuteInput");
const hexOutput = document.getElementById("hexOutput");
const binOutput = document.getElementById("binOutput");
const base64Output = document.getElementById("base64Output");

const aiLog = document.getElementById("aiLog");
const aiInput = document.getElementById("aiInput");
const aiSend = document.getElementById("aiSend");
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const settingsPanel = document.getElementById("settingsPanel");
const settingsClose = document.getElementById("settingsClose");
const apiEndpointInput = document.getElementById("apiEndpoint");
const apiKeyInput = document.getElementById("apiKey");
const apiModelInput = document.getElementById("apiModel");
const saveSettingsBtn = document.getElementById("saveSettings");
const protocolButtons = document.querySelectorAll(".protocol-btn");
const popupWarning = document.getElementById("popupWarning");
const deployOverlay = document.getElementById("deployOverlay");

const ipLine = document.getElementById("ipLine");
const locLine = document.getElementById("locLine");
const latencyLine = document.getElementById("latencyLine");

const batteryLine = document.getElementById("batteryLine");
const chargeLine = document.getElementById("chargeLine");
const cpuLine = document.getElementById("cpuLine");
const tempLine = document.getElementById("tempLine");
const windLine = document.getElementById("windLine");
const coordLine = document.getElementById("coordLine");

const arcReactor = document.getElementById("arcReactor");
const micBtn = document.getElementById("micBtn");
const sentryVideo = document.getElementById("sentryVideo");
const reticle = document.getElementById("reticle");
const sentryToggle = document.getElementById("sentryToggle");
const sentryStatus = document.getElementById("sentryStatus");

const qrModal = document.getElementById("qrModal");
const qrPanel = document.getElementById("qrPanel");
const qrClose = document.getElementById("qrClose");
const qrImage = document.getElementById("qrImage");
const qrText = document.getElementById("qrText");

const overrideModal = document.getElementById("overrideModal");
const overrideClose = document.getElementById("overrideClose");

const audioToggle = document.getElementById("audioToggle");
const audioStatus = document.getElementById("audioStatus");
const sonicCanvas = document.getElementById("sonicCanvas");
const sonicCtx = sonicCanvas.getContext("2d");

const canvas = document.getElementById("stegCanvas");
const ctx = canvas.getContext("2d");

let memoryList = [];
let injectImageLoaded = false;
let typeTimer = null;

let audioCtx = null;
let analyser = null;
let dataArray = null;
let audioActive = false;
let fallbackPhase = 0;

let selectedVoice = null;
let isListening = false;
let isSpeaking = false;
let isThinking = false;
let currentIp = "UNKNOWN";
let batteryAlerted = false;
let sentryActive = false;
let sentryStream = null;
let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let reticleX = targetX;
let reticleY = targetY;
let startupSpoken = false;
let weatherTemp = null;
let aiHistory = [];
let aiSettings = {
  endpoint: "https://api.openai.com/v1/chat/completions",
  key: "",
  model: "gpt-3.5-turbo",
};

const isUrl = (text) => /^(https?:\/\/|www\.)/i.test(text.trim());
const isCode = (text) =>
  /[{}`;]|<\/?[a-z][\s\S]*>|(function|const|let|var|=>|#include)/i.test(text);

const showToast = (message, tone = "success") => {
  toast.textContent = message;
  toast.style.borderColor =
    tone === "danger" ? "rgba(255, 59, 106, 0.8)" : "rgba(0, 255, 106, 0.8)";
  toast.style.color = tone === "danger" ? "#ff3b6a" : "var(--green)";
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1600);
};
