const RING_STATUSES = [
  "Отправляем запрос…",
  "Ждём ответ бэкенда…",
  "Сверяем данные сделки…",
];

const STEP_FLOW = [
  { active: 0, text: "Отправляем пакет на сервер…" },
  { active: 1, text: "Проверяем комплект документов…" },
  { active: 2, text: "Получаем ответ бэкенда…" },
];

const overlay = document.getElementById("overlay");
const overlayPanel = overlay.querySelector("[data-overlay-panel]");
const docsTable = document.querySelector("[data-docs-table]");
const leadForm = document.querySelector("[data-lead-form]");

function cycleText(node, values, interval) {
  if (!node) return () => {};
  let index = 0;
  const timer = window.setInterval(() => {
    index = (index + 1) % values.length;
    node.textContent = values[index];
  }, interval);
  return () => window.clearInterval(timer);
}

function renderSteps(root, activeIndex) {
  const items = root.querySelectorAll(".fc-steps__item");
  items.forEach((item, index) => {
    item.classList.toggle("is-done", index < activeIndex);
    item.classList.toggle("is-active", index === activeIndex);
  });
}

function startStepLoop(root) {
  if (!root) return () => {};
  const status = root.querySelector("[data-steps-status]");
  let index = 1;
  renderSteps(root, index);
  const timer = window.setInterval(() => {
    index = (index + 1) % STEP_FLOW.length;
    renderSteps(root, STEP_FLOW[index].active);
    if (status) status.textContent = STEP_FLOW[index].text;
  }, 1800);
  return () => window.clearInterval(timer);
}

const liveCleanups = [
  cycleText(document.querySelector("[data-live-ring] [data-ring-status]"), RING_STATUSES, 1600),
  startStepLoop(document.querySelector("[data-live-steps]")),
];

let overlayCleanup = () => {};

function closeOverlay() {
  overlay.hidden = true;
  overlayCleanup();
  overlayCleanup = () => {};
  overlayPanel.innerHTML = "";
}

function openOverlay(variant) {
  const template = document.getElementById(`tpl-${variant}`);
  if (!template) return;
  overlayCleanup();
  overlayPanel.innerHTML = "";
  overlayPanel.append(template.content.cloneNode(true));
  overlay.hidden = false;

  const ringStatus = overlayPanel.querySelector("[data-ring-status]");
  const stepsRoot = overlayPanel.querySelector("[data-live-steps]");
  const stopRing = cycleText(ringStatus, RING_STATUSES, 1400);
  const stopSteps = startStepLoop(stepsRoot);
  overlayCleanup = () => {
    stopRing();
    stopSteps();
  };
}

document.querySelectorAll("[data-open-overlay]").forEach((button) => {
  button.addEventListener("click", () => openOverlay(button.dataset.openOverlay));
});

overlay.addEventListener("click", (event) => {
  if (event.target === overlay || event.target.closest("[data-close-overlay]")) {
    closeOverlay();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !overlay.hidden) closeOverlay();
});

document.querySelector("[data-demo='docs-overlay']")?.addEventListener("click", () => {
  openOverlay("docs");
});

document.querySelector("[data-demo='skeleton']")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  docsTable.classList.add("is-loading");
  button.disabled = true;
  window.setTimeout(() => {
    docsTable.classList.remove("is-loading");
    button.disabled = false;
  }, 2200);
});

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = leadForm.querySelector(".btn-submit");
  button.classList.add("is-loading");
  button.disabled = true;
  openOverlay("ring");
  window.setTimeout(() => {
    button.classList.remove("is-loading");
    button.disabled = false;
    closeOverlay();
  }, 2600);
});

window.addEventListener("beforeunload", () => {
  liveCleanups.forEach((stop) => stop());
  overlayCleanup();
});
