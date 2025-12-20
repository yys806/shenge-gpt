const saveMemory = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryList));
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
    block.dataset.index = index;

    const tagParts = [];
    if (isUrl(item)) {
      block.classList.add("link");
      tagParts.push("URL");
    }
    if (isCode(item)) {
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
      openQrModal(item);
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
    content.textContent = item.length > 140 ? `${item.slice(0, 140)}...` : item;
    content.title = item;

    block.appendChild(head);
    block.appendChild(content);

    block.addEventListener("click", () => copyToClipboard(item));
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
  const index = Number(block.dataset.index);
  block.classList.add("shatter");
  block.addEventListener(
    "animationend",
    () => {
      memoryList.splice(index, 1);
      saveMemory();
      renderMemory();
    },
    { once: true }
  );
};

const addMemory = () => {
  const text = memoryInput.value.trim();
  if (!text) {
    return;
  }
  memoryList.unshift(text);
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
        memoryList = parsed;
      }
    } catch (error) {
      memoryList = [];
    }
  }
  renderMemory();
};

const openQrModal = (text) => {
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
