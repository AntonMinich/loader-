const RING_FACTS = [
  "Лизинг не замораживает всю сумму: покупка уже у вас, деньги остаются в обороте.",
  "Наличными вы платите 100% сразу. В лизинге — аванс, остальное удобными платежами.",
  "Пока копите наличными, цена может вырасти. Лизинг фиксирует условия сегодня.",
  "Лизинг — это способ распределить расходы во времени без необходимости копить всю сумму сразу.",
  "Финансовые цели достигаются быстрее, когда есть чёткий план платежей.",
  "Фиксированный платёж проще планировать, чем откладывать нужную покупку.",
];

const overlay = document.getElementById("overlay");
const overlayPanel = overlay.querySelector("[data-overlay-panel]");
const docsTable = document.querySelector("[data-docs-table]");
const leadForm = document.querySelector("[data-lead-form]");

function cycleText(node, values, interval) {
  if (!node) return () => {};
  let index = 0;
  const timer = window.setInterval(() => {
    node.classList.add("is-swap");
    window.setTimeout(() => {
      index = (index + 1) % values.length;
      node.textContent = values[index];
      node.classList.remove("is-swap");
    }, 220);
  }, interval);
  return () => window.clearInterval(timer);
}

const liveCleanups = [
  cycleText(document.querySelector("[data-live-ring] [data-ring-status]"), RING_FACTS, 4500),
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
  const stopRing = cycleText(ringStatus, RING_FACTS, 4500);
  overlayCleanup = () => {
    stopRing();
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
  openOverlay("print");
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
