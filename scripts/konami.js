const konamiSequence = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
let konamiIndex = 0;

const normalizeKey = (key) => (key.startsWith("Arrow") ? key : key.toLowerCase());

const triggerKonami = () => {
  playBeep();
  speak("System Override engaged.");
  document.body.classList.add("override");
  overrideModal.classList.add("active");
  overrideModal.setAttribute("aria-hidden", "false");
};

document.addEventListener("keydown", (event) => {
  const key = normalizeKey(event.key);
  const expected = konamiSequence[konamiIndex];
  if (key === expected) {
    konamiIndex += 1;
    if (konamiIndex === konamiSequence.length) {
      konamiIndex = 0;
      triggerKonami();
    }
  } else {
    konamiIndex = key === konamiSequence[0] ? 1 : 0;
  }
});

const closeOverride = () => {
  overrideModal.classList.remove("active");
  overrideModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("override");
};

overrideClose.addEventListener("click", closeOverride);
overrideModal.addEventListener("click", (event) => {
  if (event.target === overrideModal) {
    closeOverride();
  }
});
