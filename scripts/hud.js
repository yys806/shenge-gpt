const setEnvOffline = (keepCoord = false) => {
  tempLine.textContent = "TEMP: SENSOR OFFLINE";
  windLine.textContent = "WIND: SENSOR OFFLINE";
  if (!keepCoord) {
    coordLine.textContent = "COORD: SENSOR OFFLINE";
  }
};

const updateBatteryUi = (battery) => {
  const level = Math.round(battery.level * 100);
  batteryLine.textContent = `BATTERY: ${level}%`;
  chargeLine.textContent = `STATUS: ${battery.charging ? "CHARGING" : "ON BATTERY"}`;
  if (level < 20 && !batteryAlerted) {
    speak("Power critical.");
    batteryAlerted = true;
  }
  if (level >= 25) {
    batteryAlerted = false;
  }
};

const initBattery = () => {
  if (!navigator.getBattery) {
    batteryLine.textContent = "BATTERY: UNAVAILABLE";
    chargeLine.textContent = "STATUS: OFFLINE";
    return;
  }
  navigator
    .getBattery()
    .then((battery) => {
      updateBatteryUi(battery);
      battery.addEventListener("levelchange", () => updateBatteryUi(battery));
      battery.addEventListener("chargingchange", () => updateBatteryUi(battery));
    })
    .catch(() => {
      batteryLine.textContent = "BATTERY: OFFLINE";
      chargeLine.textContent = "STATUS: OFFLINE";
    });
};

const initHardware = () => {
  const cores = navigator.hardwareConcurrency;
  cpuLine.textContent = `CPU CORES: ${typeof cores === "number" ? cores : "UNAVAILABLE"}`;
  initBattery();
};

const speakStartup = (tempValue) => {
  if (startupSpoken) {
    return;
  }
  startupSpoken = true;
  const rounded =
    typeof tempValue === "number" && !Number.isNaN(tempValue)
      ? Math.round(tempValue)
      : null;
  const message =
    rounded !== null
      ? `System Online. Temperature is ${rounded} degrees. Welcome back, Sir.`
      : "System Online. Weather sensors offline. Welcome back, Sir.";
  speak(message);
};

const initWeather = () => {
  if (!navigator.geolocation) {
    setEnvOffline();
    locLine.textContent = "LOC: SENSOR OFFLINE";
    speakStartup(null);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const latText = latitude.toFixed(2);
      const lonText = longitude.toFixed(2);
      coordLine.textContent = `COORD: ${latText}, ${lonText}`;
      locLine.textContent = `LOC: ${latText}, ${lonText}`;
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("weather");
        }
        const data = await response.json();
        const current = data.current_weather || {};
        if (typeof current.temperature === "number") {
          weatherTemp = current.temperature;
          tempLine.textContent = `TEMP: ${Math.round(current.temperature)}°C`;
        } else {
          tempLine.textContent = "TEMP: SENSOR OFFLINE";
        }
        if (typeof current.windspeed === "number") {
          windLine.textContent = `WIND: ${Math.round(current.windspeed)} km/h`;
        } else {
          windLine.textContent = "WIND: SENSOR OFFLINE";
        }
        speakStartup(weatherTemp);
      } catch (error) {
        setEnvOffline(true);
        speakStartup(null);
      }
    },
    () => {
      setEnvOffline();
      locLine.textContent = "LOC: SENSOR OFFLINE";
      speakStartup(null);
    },
    { timeout: 8000 }
  );
};

const setSentryStatus = (text, offline = false) => {
  if (!sentryStatus) {
    return;
  }
  sentryStatus.textContent = text;
  sentryStatus.classList.toggle("offline", offline);
};

const startSentry = async () => {
  if (sentryActive) {
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setSentryStatus("SENTRY: OFFLINE", true);
    return;
  }
  try {
    sentryStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    sentryVideo.srcObject = sentryStream;
    await sentryVideo.play();
    sentryActive = true;
    document.body.classList.add("sentry");
    reticle.classList.add("active");
    setSentryStatus("SENTRY: ONLINE");
  } catch (error) {
    sentryActive = false;
    if (sentryStream) {
      sentryStream.getTracks().forEach((track) => track.stop());
      sentryStream = null;
    }
    setSentryStatus("SENTRY: OFFLINE", true);
    document.body.classList.remove("sentry");
    reticle.classList.remove("active");
  }
};

const stopSentry = () => {
  if (sentryStream) {
    sentryStream.getTracks().forEach((track) => track.stop());
  }
  sentryStream = null;
  sentryVideo.srcObject = null;
  sentryActive = false;
  document.body.classList.remove("sentry");
  reticle.classList.remove("active");
  setSentryStatus("SENTRY: OFF");
};

const toggleSentry = () => {
  if (sentryActive) {
    stopSentry();
  } else {
    startSentry();
  }
};

const initSentry = () => {
  if (!sentryToggle) {
    return;
  }
  setSentryStatus("SENTRY: OFF");
  sentryToggle.addEventListener("click", toggleSentry);
};

const animateReticle = () => {
  if (reticle) {
    const ease = sentryActive ? 0.12 : 0.06;
    reticleX += (targetX - reticleX) * ease;
    reticleY += (targetY - reticleY) * ease;
    reticle.style.left = `${reticleX}px`;
    reticle.style.top = `${reticleY}px`;
  }
  requestAnimationFrame(animateReticle);
};

const updateLatency = () => {
  const value = Math.floor(18 + Math.random() * 60);
  latencyLine.textContent = `LATENCY: ${value}ms`;
};

const loadIpAddress = async () => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    currentIp = data.ip || "UNKNOWN";
    ipLine.textContent = `IP: ${currentIp}`;
  } catch (error) {
    currentIp = "OFFLINE";
    ipLine.textContent = "IP: OFFLINE";
  }
};
