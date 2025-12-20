const resizeSonic = () => {
  const dpr = window.devicePixelRatio || 1;
  const rect = sonicCanvas.getBoundingClientRect();
  sonicCanvas.width = rect.width * dpr;
  sonicCanvas.height = rect.height * dpr;
  sonicCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

const drawSonic = () => {
  requestAnimationFrame(drawSonic);
  const width = sonicCanvas.clientWidth;
  const height = sonicCanvas.clientHeight;
  if (!width || !height) {
    return;
  }

  sonicCtx.clearRect(0, 0, width, height);
  sonicCtx.fillStyle = "rgba(5, 5, 5, 0.85)";
  sonicCtx.fillRect(0, 0, width, height);

  sonicCtx.strokeStyle = "rgba(0, 243, 255, 0.12)";
  sonicCtx.lineWidth = 1;
  for (let i = 1; i <= 3; i += 1) {
    const y = (height / 4) * i;
    sonicCtx.beginPath();
    sonicCtx.moveTo(0, y);
    sonicCtx.lineTo(width, y);
    sonicCtx.stroke();
  }

  const barCount = dataArray ? dataArray.length : 64;
  const barWidth = width / barCount;

  if (analyser && audioCtx && audioCtx.state === "running") {
    analyser.getByteFrequencyData(dataArray);
  } else {
    if (!dataArray) {
      dataArray = new Uint8Array(64);
    }
    for (let i = 0; i < dataArray.length; i += 1) {
      dataArray[i] =
        40 +
        30 * Math.sin(fallbackPhase + i * 0.35) +
        12 * Math.sin(fallbackPhase * 0.6 + i * 0.15);
    }
    fallbackPhase += 0.04;
  }

  sonicCtx.shadowColor = "rgba(0, 243, 255, 0.6)";
  sonicCtx.shadowBlur = 10;
  sonicCtx.fillStyle = "rgba(0, 243, 255, 0.8)";

  for (let i = 0; i < barCount; i += 1) {
    const value = dataArray[i] / 255;
    const barHeight = Math.max(4, value * (height - 10));
    const x = i * barWidth;
    const y = height - barHeight;
    sonicCtx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
  }

  sonicCtx.shadowBlur = 0;
};

const initAudio = () => {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.08;

  const osc1 = audioCtx.createOscillator();
  osc1.type = "sawtooth";
  osc1.frequency.value = 70;

  const osc2 = audioCtx.createOscillator();
  osc2.type = "triangle";
  osc2.frequency.value = 112;

  const noiseBuffer = audioCtx.createBuffer(
    1,
    audioCtx.sampleRate * 2,
    audioCtx.sampleRate
  );
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i += 1) {
    noiseData[i] = (Math.random() * 2 - 1) * 0.25;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.value = 0.03;

  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 0.4;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.02;

  lfo.connect(lfoGain);
  lfoGain.connect(masterGain.gain);

  osc1.connect(masterGain);
  osc2.connect(masterGain);
  noise.connect(noiseGain);
  noiseGain.connect(masterGain);

  masterGain.connect(analyser);
  analyser.connect(audioCtx.destination);

  osc1.start();
  osc2.start();
  noise.start();
  lfo.start();
};

const updateAudioUi = () => {
  audioToggle.textContent = audioActive ? "MUTE AUDIO" : "INITIALIZE AUDIO";
  audioStatus.textContent = audioActive ? "AUDIO: ONLINE" : "AUDIO: OFFLINE";
};

const stopAllAudio = () => {
  stopSpeech();
  if (audioCtx && audioCtx.state === "running") {
    audioCtx.suspend();
  }
  audioActive = false;
  updateAudioUi();
};

const toggleAudio = async () => {
  if (!audioCtx) {
    initAudio();
  }
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
    audioActive = true;
  } else {
    await audioCtx.suspend();
    audioActive = false;
  }
  updateAudioUi();
};

audioToggle.addEventListener("click", toggleAudio);

const playBeep = () => {
  const ctxToUse = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctxToUse.createOscillator();
  const gain = ctxToUse.createGain();
  osc.type = "square";
  osc.frequency.value = 880;
  gain.gain.value = 0.2;
  osc.connect(gain);
  gain.connect(ctxToUse.destination);
  ctxToUse.resume();
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctxToUse.currentTime + 0.2);
  osc.stop(ctxToUse.currentTime + 0.25);
  if (!audioCtx) {
    osc.onended = () => ctxToUse.close();
  }
};

const playLaunchSound = () => {
  const useShared = audioCtx && audioActive && audioCtx.state === "running";
  const ctxToUse =
    useShared
      ? audioCtx
      : new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctxToUse.createOscillator();
  const gain = ctxToUse.createGain();
  const now = ctxToUse.currentTime;
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.6);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
  osc.connect(gain);
  gain.connect(ctxToUse.destination);
  osc.start(now);
  osc.stop(now + 0.65);
  if (!useShared) {
    osc.onended = () => ctxToUse.close();
  }
};

const showDeployOverlay = () => {
  if (!deployOverlay) {
    return;
  }
  deployOverlay.classList.add("active");
  clearTimeout(showDeployOverlay.timer);
  showDeployOverlay.timer = setTimeout(
    () => deployOverlay.classList.remove("active"),
    1200
  );
};
