updateLatency();
setInterval(updateLatency, 2000);
loadIpAddress();
initSpeech();
initRecognition();
initHardware();
initWeather();
initSentry();
loadAiSettings();
appendLog("system", "NEURAL LINK: READY.");

window.addEventListener("resize", () => {
  resizeSonic();
  targetX = window.innerWidth / 2;
  targetY = window.innerHeight / 2;
});
window.addEventListener("mousemove", (event) => {
  targetX = event.clientX;
  targetY = event.clientY;
});
window.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    targetX = touch.clientX;
    targetY = touch.clientY;
  },
  { passive: true }
);

loadMemory();
resetInject();
resetExtract();
updateTransmute();
resizeSonic();
drawSonic();
animateReticle();
