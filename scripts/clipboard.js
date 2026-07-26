// 每个数据块持有运行时唯一 id，删除时按 id 定位，
// 避免渲染时 index 在并发删除/重渲染后失效的竞态。
const makeBlockId = () =>
  window.crypto && typeof window.crypto.randomUUID === "function"
    ? window.crypto.randomUUID()
    : `blk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const saveMemory = () => {
  // 存储格式保持为纯文本数组，与旧版本数据兼容
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(memoryList.map((item) => item.text))
  );
};

const renderMemory = () => {
  memoryGrid.innerHTML = "";
  if (!memoryList.length) {
    const empty = document.createElement("div");
    empty.className = "memory-hint";
    empty.textContent = "尚无数据块，输入内容后敲 Enter 写入。";
    memoryGrid.appendChild(empty);
    return;
  }

  memoryList.forEach((item, index) => {
    const block = document.createElement("div");
    block.className = "data-block";
    block.dataset.id = item.id;

    const tagParts = [];
    if (isUrl(item.text)) {
      block.classList.add("link");
      tagParts.push("URL");
    }
    if (isCode(item.text)) {
      block.classList.add("code");
      tagParts.push("CODE");
    }

    const head = document.createElement("div");
    head.className = "block-head";

    const meta = document.createElement("div");
    meta.className = "block-meta";
    const idSpan = document.createElement("span");
    idSpan.textContent = `#${String(index + 1).padStart(3, "0")}`;
    meta.appendChild(idSpan);

    if (tagParts.length) {
      tagParts.forEach((tag) => {
        const flag = document.createElement("span");
        flag.className = "block-flag" + (tag === "CODE" ? " code" : "");
        flag.textContent = tag;
        meta.appendChild(flag);
      });
    }

    const actions = document.createElement("div");
    actions.className = "block-actions";

    const qrBtn = document.createElement("button");
    qrBtn.type = "button";
    qrBtn.className = "icon-btn qr-btn";
    qrBtn.title = "生成 QR";
    qrBtn.textContent = "QR";
    qrBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      openQrModal(item.text);
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "icon-btn delete-btn";
    delBtn.title = "删除";
    delBtn.textContent = "X";
    delBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteBlock(block);
    });

    actions.appendChild(qrBtn);
    actions.appendChild(delBtn);

    head.appendChild(meta);
    head.appendChild(actions);

    const content = document.createElement("div");
    content.className = "block-content";
    content.textContent =
      item.text.length > 140 ? `${item.text.slice(0, 140)}...` : item.text;
    content.title = item.text;

    block.appendChild(head);
    block.appendChild(content);

    block.addEventListener("click", () => copyToClipboard(item.text));
    block.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      deleteBlock(block);
    });

    memoryGrid.appendChild(block);
  });
};

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }
    showToast("COPIED: 已写入剪贴板");
    speak("Data copied.");
  } catch (error) {
    showToast("复制失败，请重试", "danger");
  }
};

const deleteBlock = (block) => {
  const { id } = block.dataset;
  const index = memoryList.findIndex((item) => item.id === id);
  if (index === -1) {
    // 已被删除（如快速重复点击），忽略
    return;
  }
  // 先从数据层删除并落盘，动画只负责视觉过渡，
  // 这样并发删除或中途重渲染都不会误删/漏删。
  memoryList.splice(index, 1);
  saveMemory();

  block.classList.add("shatter");
  block.style.pointerEvents = "none";
  let finished = false;
  const finish = () => {
    if (finished) {
      return;
    }
    finished = true;
    renderMemory();
  };
  block.addEventListener("animationend", finish, { once: true });
  // 动画被禁用或节点提前被移除时的兜底
  setTimeout(finish, 450);
};

const addMemory = () => {
  const text = memoryInput.value.trim();
  if (!text) {
    return;
  }
  memoryList.unshift({ id: makeBlockId(), text });
  memoryInput.value = "";
  saveMemory();
  renderMemory();
};

const clearMemory = () => {
  memoryList = [];
  saveMemory();
  renderMemory();
};

const loadMemory = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // 兼容旧版纯字符串数组与可能的对象格式
        memoryList = parsed
          .map((entry) => {
            if (typeof entry === "string") {
              return { id: makeBlockId(), text: entry };
            }
            if (entry && typeof entry.text === "string") {
              return { id: makeBlockId(), text: entry.text };
            }
            return null;
          })
          .filter(Boolean);
      }
    } catch (error) {
      memoryList = [];
    }
  }
  renderMemory();
};

const openQrModal = (text) => {
  // 二维码由第三方服务生成，数据块内容会随请求离开本机。
  // 发送前必须让用户知情并确认。
  const confirmed = window.confirm(
    "生成二维码将把该数据块内容发送到第三方服务 api.qrserver.com。\n" +
      "如内容包含密码、密钥等隐私信息，请勿继续。\n\n是否继续生成？"
  );
  if (!confirmed) {
    return;
  }
  const encoded = encodeURIComponent(text);
  qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encoded}`;
  qrText.textContent = text;
  qrModal.classList.add("active");
  qrModal.setAttribute("aria-hidden", "false");
  qrPanel.classList.remove("glitch-in");
  void qrPanel.offsetWidth;
  qrPanel.classList.add("glitch-in");
};

const closeQrModal = () => {
  qrModal.classList.remove("active");
  qrModal.setAttribute("aria-hidden", "true");
};

qrClose.addEventListener("click", closeQrModal);
qrModal.addEventListener("click", (event) => {
  if (event.target === qrModal) {
    closeQrModal();
  }
});

addMemoryBtn.addEventListener("click", addMemory);
memoryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addMemory();
  }
});
