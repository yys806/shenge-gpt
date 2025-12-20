const updateArcState = () => {
  if (!arcReactor) {
    return;
  }
  arcReactor.classList.remove("listening", "speaking", "thinking");
  if (isListening) {
    arcReactor.classList.add("listening");
    return;
  }
  if (isSpeaking) {
    arcReactor.classList.add("speaking");
    return;
  }
  if (isThinking) {
    arcReactor.classList.add("thinking");
  }
};

const pickVoice = () => {
  if (!("speechSynthesis" in window)) {
    return;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    return;
  }
  const preferred = [
    "Microsoft David",
    "Google US English Male",
    "Google UK English Male",
    "Alex",
    "Daniel",
    "George",
  ];
  const maleTokens = ["male", "david", "alex", "mark", "george", "daniel"];
  selectedVoice =
    voices.find((voice) => preferred.some((name) => voice.name.includes(name))) ||
    voices.find((voice) =>
      maleTokens.some((token) => voice.name.toLowerCase().includes(token))
    ) ||
    voices.find((voice) => /en(-|_)us/i.test(voice.lang)) ||
    voices.find((voice) => voice.lang && voice.lang.startsWith("en")) ||
    voices[0];
};

const speak = (text) => {
  if (!text || !("speechSynthesis" in window)) {
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  utterance.rate = 0.95;
  utterance.pitch = 0.8;
  utterance.volume = 1;
  utterance.onstart = () => {
    isSpeaking = true;
    updateArcState();
  };
  utterance.onend = () => {
    isSpeaking = false;
    updateArcState();
  };
  utterance.onerror = () => {
    isSpeaking = false;
    updateArcState();
  };
  window.speechSynthesis.speak(utterance);
};

const stopSpeech = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  isSpeaking = false;
  updateArcState();
};

const initSpeech = () => {
  if (!("speechSynthesis" in window)) {
    return;
  }
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
};

const initRecognition = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (micBtn) {
      micBtn.style.display = "none";
    }
    showToast("语音识别不可用", "danger");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    updateArcState();
    micBtn.classList.add("recording");
    micBtn.textContent = "REC";
  };

  recognition.onend = () => {
    isListening = false;
    updateArcState();
    micBtn.classList.remove("recording");
    micBtn.textContent = "MIC";
  };

  recognition.onerror = () => {
    showToast("语音识别失败", "danger");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (typeof window.handleCommand === "function") {
      window.handleCommand(transcript);
    } else {
      showToast(`未识别指令: ${transcript}`, "danger");
    }
  };

  micBtn.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });
};
