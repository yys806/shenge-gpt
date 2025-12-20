panelTabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    panelTabs.forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");
    const panel = btn.dataset.panel;
    cipherPanel.classList.toggle("active", panel === "cipher");
    transmutePanel.classList.toggle("active", panel === "transmute");
  });
});

document.querySelectorAll(".cipher-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".cipher-tab")
      .forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");

    const mode = btn.dataset.mode;
    document.getElementById("injectPanel").classList.toggle(
      "active",
      mode === "inject"
    );
    document.getElementById("extractPanel").classList.toggle(
      "active",
      mode === "extract"
    );
  });
});

const loadImageToCanvas = (file, callback, previewEl) => {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      callback(img);
    };
    img.src = reader.result;
    if (previewEl) {
      previewEl.src = reader.result;
      previewEl.classList.remove("hidden");
    }
  };
  reader.readAsDataURL(file);
};

const getCapacityBytes = () => {
  const totalBits = canvas.width * canvas.height * 3;
  return Math.max(0, Math.floor((totalBits - 32) / 8));
};

const encodeLSB = (imageData, payload) => {
  const data = imageData.data;
  const capacityBits = (data.length / 4) * 3;
  const totalBits = 32 + payload.length * 8;
  if (totalBits > capacityBits) {
    throw new Error("超出容量");
  }

  let bitIndex = 0;
  const writeBit = (bit) => {
    const channelIndex = bitIndex % 3;
    const pixelIndex = Math.floor(bitIndex / 3);
    const dataIndex = pixelIndex * 4 + channelIndex;
    data[dataIndex] = (data[dataIndex] & 0xfe) | bit;
    bitIndex += 1;
  };

  for (let i = 31; i >= 0; i -= 1) {
    writeBit((payload.length >> i) & 1);
  }

  payload.forEach((byte) => {
    for (let i = 7; i >= 0; i -= 1) {
      writeBit((byte >> i) & 1);
    }
  });

  return imageData;
};

const decodeLSB = (imageData) => {
  const data = imageData.data;
  const capacityBits = (data.length / 4) * 3;
  if (capacityBits < 32) {
    throw new Error("图像尺寸过小");
  }

  const readBit = (bitIndex) => {
    const channelIndex = bitIndex % 3;
    const pixelIndex = Math.floor(bitIndex / 3);
    const dataIndex = pixelIndex * 4 + channelIndex;
    return data[dataIndex] & 1;
  };

  let length = 0;
  for (let i = 0; i < 32; i += 1) {
    length = (length << 1) | readBit(i);
  }

  const totalBits = 32 + length * 8;
  if (totalBits > capacityBits) {
    throw new Error("未检测到有效内容");
  }

  const bytes = new Uint8Array(length);
  let offset = 32;
  for (let i = 0; i < length; i += 1) {
    let value = 0;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value << 1) | readBit(offset + bit);
    }
    bytes[i] = value;
    offset += 8;
  }

  return new TextDecoder().decode(bytes);
};

const bytesToHex = (bytes) =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(" ");

const bytesToBin = (bytes) =>
  Array.from(bytes)
    .map((byte) => byte.toString(2).padStart(8, "0"))
    .join(" ");

const bytesToBase64 = (bytes) => {
  if (!bytes.length) {
    return "";
  }
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const triggerFlicker = (element) => {
  if (!element) {
    return;
  }
  element.classList.remove("flicker");
  void element.offsetWidth;
  element.classList.add("flicker");
  clearTimeout(element.flickerTimer);
  element.flickerTimer = setTimeout(
    () => element.classList.remove("flicker"),
    260
  );
};

const updateTransmute = () => {
  const text = transmuteInput.value;
  if (!text) {
    hexOutput.textContent = "";
    binOutput.textContent = "";
    base64Output.textContent = "";
    return;
  }
  const bytes = new TextEncoder().encode(text);
  hexOutput.textContent = bytesToHex(bytes);
  binOutput.textContent = bytesToBin(bytes);
  let base64 = "";
  try {
    base64 = bytesToBase64(bytes);
  } catch (error) {
    base64 = "";
  }
  base64Output.textContent = base64;
  [hexOutput, binOutput, base64Output].forEach(triggerFlicker);
};

const resetInject = () => {
  injectFile.value = "";
  injectPreview.src = "";
  injectPreview.classList.add("hidden");
  injectImageLoaded = false;
  injectCapacity.textContent = "";
  downloadLink.href = "#";
  downloadLink.classList.add("disabled");
};

const resetExtract = () => {
  extractFile.value = "";
  extractOutput.textContent = "等待图像输入...";
  extractOutput.classList.remove("typing");
  clearInterval(typeTimer);
  canvas.width = 0;
  canvas.height = 0;
};

injectFile.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  downloadLink.href = "#";
  downloadLink.classList.add("disabled");
  loadImageToCanvas(
    file,
    () => {
      injectImageLoaded = true;
      const capacity = getCapacityBytes();
      injectCapacity.textContent = `可容纳约 ${capacity} 字节数据`;
    },
    injectPreview
  );
});

injectBtn.addEventListener("click", () => {
  if (!injectImageLoaded) {
    showToast("请先选择图片", "danger");
    return;
  }
  const secret = secretInput.value;
  if (!secret.trim()) {
    showToast("请输入需要隐藏的文本", "danger");
    return;
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bytes = new TextEncoder().encode(secret);
  try {
    const encoded = encodeLSB(imageData, bytes);
    ctx.putImageData(encoded, 0, 0);
    const url = canvas.toDataURL("image/png");
    downloadLink.href = url;
    downloadLink.classList.remove("disabled");
    showToast("注入完成，可下载图像");
    speak("Encryption complete.");
  } catch (error) {
    showToast("文本过长，超出图像容量！", "danger");
  }
});

downloadLink.addEventListener("click", (event) => {
  if (downloadLink.classList.contains("disabled")) {
    event.preventDefault();
  }
});

injectClear.addEventListener("click", resetInject);

const typewriter = (element, text) => {
  clearInterval(typeTimer);
  element.textContent = "";
  element.classList.add("typing");
  let index = 0;
  typeTimer = setInterval(() => {
    element.textContent = text.slice(0, index);
    index += 1;
    if (index > text.length) {
      clearInterval(typeTimer);
      element.classList.remove("typing");
    }
  }, 30);
};

extractFile.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  loadImageToCanvas(file, () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    try {
      const message = decodeLSB(imageData);
      typewriter(
        extractOutput,
        message || "未检测到隐藏内容，可能为空或损坏。"
      );
    } catch (error) {
      typewriter(extractOutput, "解析失败：无法读取隐藏内容。");
    }
  });
});

extractClear.addEventListener("click", resetExtract);
transmuteInput.addEventListener("input", updateTransmute);
