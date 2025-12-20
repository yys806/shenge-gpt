const protocolSets = {
  academic: [
    "https://gemini.google.com/",
    "http://1.tongji.edu.cn/",
    "https://canvas.tongji.edu.cn/",
    "https://github.com/",
  ],
  command: ["https://shen806.dpdns.org/", "https://shen.chat/"],
};
protocolSets.total = Array.from(
  new Set([...protocolSets.academic, ...protocolSets.command])
);

const launchProtocol = (key) => {
  const urls = protocolSets[key];
  if (!urls) {
    return;
  }
  showDeployOverlay();
  playLaunchSound();
  let blocked = false;
  urls.forEach((url) => {
    const win = window.open(url, "_blank");
    if (!win) {
      blocked = true;
    }
  });
  if (popupWarning) {
    popupWarning.classList.toggle("hidden", !blocked);
  }
  if (blocked) {
    showToast("弹窗被拦截，请允许弹窗", "danger");
  }
};

protocolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.protocol;
    launchProtocol(key);
  });
});
