const normalizeEndpoint = (endpoint) => {
  if (!endpoint) {
    return endpoint;
  }
  try {
    const url = new URL(endpoint);
    const trimmedPath = url.pathname.replace(/\/+$/, "");
    if (!trimmedPath) {
      url.pathname = url.hostname.includes("deepseek")
        ? "/chat/completions"
        : "/v1/chat/completions";
      return url.toString();
    }
    if (trimmedPath === "/v1") {
      url.pathname = "/v1/chat/completions";
      return url.toString();
    }
    return endpoint;
  } catch (error) {
    return endpoint;
  }
};

const defaultModelForEndpoint = (endpoint, fallbackModel) => {
  if (!endpoint) {
    return fallbackModel;
  }
  try {
    const url = new URL(endpoint);
    if (url.hostname.includes("deepseek")) {
      return "deepseek-chat";
    }
  } catch (error) {
    return fallbackModel;
  }
  return fallbackModel;
};

const appendLog = (role, text) => {
  if (!aiLog) {
    return null;
  }
  const entry = document.createElement("div");
  entry.className = `ai-entry ${role}`;
  entry.textContent = text;
  aiLog.appendChild(entry);
  aiLog.scrollTop = aiLog.scrollHeight;
  return entry;
};

const loadAiSettings = () => {
  const endpoint = localStorage.getItem(AI_ENDPOINT_KEY);
  const key = localStorage.getItem(AI_KEY_KEY);
  const model = localStorage.getItem(AI_MODEL_KEY);
  aiSettings.endpoint = normalizeEndpoint(endpoint || aiSettings.endpoint);
  aiSettings.key = key || "";
  aiSettings.model = model || aiSettings.model;
  if (
    aiSettings.endpoint.includes("deepseek") &&
    (!model || aiSettings.model === "gpt-3.5-turbo")
  ) {
    aiSettings.model = "deepseek-chat";
    localStorage.setItem(AI_MODEL_KEY, aiSettings.model);
  }
  if (apiEndpointInput) {
    apiEndpointInput.value = aiSettings.endpoint;
  }
  if (apiKeyInput) {
    apiKeyInput.value = aiSettings.key;
  }
  if (apiModelInput) {
    apiModelInput.value = aiSettings.model;
  }
};

const closeSettings = () => {
  if (!settingsModal) {
    return;
  }
  settingsModal.classList.remove("active");
  settingsModal.setAttribute("aria-hidden", "true");
};

const openSettings = () => {
  if (!settingsModal) {
    return;
  }
  settingsModal.classList.add("active");
  settingsModal.setAttribute("aria-hidden", "false");
  if (apiEndpointInput) {
    apiEndpointInput.focus();
  }
};

const saveAiSettings = () => {
  if (apiEndpointInput) {
    const value = apiEndpointInput.value.trim();
    if (value) {
      aiSettings.endpoint = normalizeEndpoint(value);
      apiEndpointInput.value = aiSettings.endpoint;
    }
  }
  if (apiKeyInput) {
    aiSettings.key = apiKeyInput.value.trim();
  }
  if (apiModelInput) {
    const value = apiModelInput.value.trim();
    if (value) {
      aiSettings.model = value;
    } else {
      aiSettings.model = defaultModelForEndpoint(
        aiSettings.endpoint,
        aiSettings.model
      );
      apiModelInput.value = aiSettings.model;
    }
  }
  localStorage.setItem(AI_ENDPOINT_KEY, aiSettings.endpoint);
  if (aiSettings.key) {
    localStorage.setItem(AI_KEY_KEY, aiSettings.key);
  } else {
    localStorage.removeItem(AI_KEY_KEY);
  }
  localStorage.setItem(AI_MODEL_KEY, aiSettings.model);
  showToast("配置已保存");
  closeSettings();
};

const setThinking = (state) => {
  isThinking = state;
  updateArcState();
};

const sendToAi = async (prompt) => {
  const cleaned = prompt.trim();
  if (!cleaned) {
    return;
  }
  if (!aiSettings.endpoint || !aiSettings.key) {
    showToast("请先配置 API 端点与密钥", "danger");
    appendLog("system", "NEURAL LINK: CONFIG REQUIRED.");
    openSettings();
    return;
  }
  appendLog("user", cleaned);
  aiHistory.push({ role: "user", content: cleaned });
  if (aiHistory.length > 8) {
    aiHistory = aiHistory.slice(-8);
  }
  setThinking(true);
  const thinkingEntry = appendLog("system", "NEURAL LINK: THINKING...");
  try {
    const payload = {
      model: aiSettings.model,
      messages: [
        { role: "system", content: AI_SYSTEM_PROMPT },
        ...aiHistory,
      ],
      temperature: 0.6,
    };
    const endpoint = normalizeEndpoint(aiSettings.endpoint);
    if (endpoint !== aiSettings.endpoint) {
      aiSettings.endpoint = endpoint;
      localStorage.setItem(AI_ENDPOINT_KEY, aiSettings.endpoint);
      if (apiEndpointInput) {
        apiEndpointInput.value = aiSettings.endpoint;
      }
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiSettings.key}`,
      },
      body: JSON.stringify(payload),
    });
    const rawText = await response.text();
    let data = null;
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        throw new Error(
          `INVALID RESPONSE (${response.status}): ${rawText.slice(0, 180)}`
        );
      }
    }
    if (!response.ok) {
      const errorText =
        data && data.error && data.error.message
          ? data.error.message
          : rawText || `${response.status} ${response.statusText}`;
      throw new Error(errorText);
    }
    const message =
      data &&
      data.choices &&
      data.choices[0] &&
      (data.choices[0].message
        ? data.choices[0].message.content
        : data.choices[0].text);
    const answer = message ? message.trim() : "";
    if (!answer) {
      throw new Error(rawText ? "UNSUPPORTED RESPONSE FORMAT" : "EMPTY RESPONSE BODY");
    }
    aiHistory.push({ role: "assistant", content: answer });
    if (aiHistory.length > 8) {
      aiHistory = aiHistory.slice(-8);
    }
    appendLog("assistant", answer);
    if (thinkingEntry) {
      thinkingEntry.textContent = "NEURAL LINK: READY.";
    }
    setThinking(false);
    speak(answer);
  } catch (error) {
    if (thinkingEntry) {
      thinkingEntry.textContent = "NEURAL LINK: ERROR.";
    }
    setThinking(false);
    showToast("AI 请求失败", "danger");
    appendLog("system", `AI ERROR: ${error.message || "UNKNOWN"}`);
  }
};

const applyTheme = (mode) => {
  const root = document.documentElement;
  if (mode === "red") {
    root.style.setProperty("--cyan", "#ff3b3b");
    root.style.setProperty("--purple", "#ff0066");
    root.style.setProperty("--green", "#ff8a8a");
    root.style.setProperty("--text", "#ffecec");
    root.style.setProperty("--muted", "#ffb3b3");
    return;
  }
  root.style.setProperty("--cyan", "#00f3ff");
  root.style.setProperty("--purple", "#bd00ff");
  root.style.setProperty("--green", "#00ff6a");
  root.style.setProperty("--text", "#d7f8ff");
  root.style.setProperty("--muted", "#7be7ff");
};

const executeCommand = (transcript) => {
  const clean = transcript.trim().toLowerCase();
  if (!clean) {
    return true;
  }
  const hasWord = (word) => new RegExp(`\\b${word}\\b`, "i").test(clean);
  if (hasWord("status") || hasWord("report")) {
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    const ip = currentIp || "UNKNOWN";
    speak(`Status report. Time ${time}. IP ${ip}.`);
    showToast("状态播报完成");
    return true;
  }
  if (hasWord("time")) {
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    speak(`Current time ${time}.`);
    showToast(`当前时间 ${time}`);
    return true;
  }
  if (clean.includes("clear memory")) {
    clearMemory();
    showToast("记忆池已清空");
    speak("Memory cleared.");
    return true;
  }
  if (hasWord("silence")) {
    stopAllAudio();
    showToast("已静音");
    return true;
  }
  if (hasWord("red")) {
    applyTheme("red");
    showToast("已切换红色主题");
    return true;
  }
  if (hasWord("blue")) {
    applyTheme("blue");
    showToast("已切换蓝色主题");
    return true;
  }
  if (hasWord("sentry")) {
    if (hasWord("off") || hasWord("disable") || hasWord("stop")) {
      stopSentry();
      showToast("SENTRY 已关闭");
      return true;
    }
    if (hasWord("on") || hasWord("enable") || hasWord("start")) {
      startSentry();
      showToast("SENTRY 已启动");
      return true;
    }
    toggleSentry();
    showToast("SENTRY 已切换");
    return true;
  }
  return false;
};

const processInput = (text) => {
  const cleaned = text.trim();
  if (!cleaned) {
    return;
  }
  const executed = executeCommand(cleaned);
  if (executed) {
    appendLog("user", cleaned);
    appendLog("system", "COMMAND EXECUTED.");
    return;
  }
  sendToAi(cleaned);
};

const submitAiInput = () => {
  if (!aiInput) {
    return;
  }
  const value = aiInput.value;
  aiInput.value = "";
  processInput(value);
};

const handleCommand = (transcript) => {
  processInput(transcript);
};

window.handleCommand = handleCommand;

if (settingsBtn) {
  settingsBtn.addEventListener("click", openSettings);
}
if (settingsClose) {
  settingsClose.addEventListener("click", closeSettings);
}
if (settingsModal) {
  settingsModal.addEventListener("click", (event) => {
    if (event.target === settingsModal) {
      closeSettings();
    }
  });
}
if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener("click", saveAiSettings);
}
if (aiSend) {
  aiSend.addEventListener("click", submitAiInput);
}
if (aiInput) {
  aiInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitAiInput();
    }
  });
}
