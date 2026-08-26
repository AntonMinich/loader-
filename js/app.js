const RING_FACTS = [
  "Лизинг не замораживает всю сумму: покупка уже у вас, деньги остаются в обороте.",
  "Наличными вы платите 100% сразу. В лизинге — аванс, остальное удобными платежами.",
  "Пока копите наличными, цена может вырасти. Лизинг фиксирует условия сегодня.",
  "Лизинг — это способ распределить расходы во времени без необходимости копить всю сумму сразу.",
  "Финансовые цели достигаются быстрее, когда есть чёткий план платежей.",
  "Фиксированный платёж проще планировать, чем откладывать нужную покупку.",
];

const FACT_INTERVAL_MS = 3000;
const overlay = document.getElementById("overlay");
const overlayPanel = overlay.querySelector("[data-overlay-panel]");

let lastStartedFact = null;

function shuffle(items) {
  const bag = [...items];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

function createFactBag(values, avoidFirst) {
  let remaining = [];
  let lastEmitted = null;

  function refill() {
    remaining = shuffle(values);
    const avoid = lastEmitted || avoidFirst;
    if (avoid && remaining.length > 1 && remaining[0] === avoid) {
      const swap = 1 + Math.floor(Math.random() * (remaining.length - 1));
      [remaining[0], remaining[swap]] = [remaining[swap], remaining[0]];
    }
  }

  function next() {
    if (!remaining.length) refill();
    lastEmitted = remaining.shift();
    return lastEmitted;
  }

  return { next };
}

function cycleFacts(node, interval) {
  if (!node) return () => {};
  const bag = createFactBag(RING_FACTS, lastStartedFact);
  const first = bag.next();
  lastStartedFact = first;
  node.textContent = first;

  const timer = window.setInterval(() => {
    node.classList.add("is-swap");
    window.setTimeout(() => {
      node.textContent = bag.next();
      node.classList.remove("is-swap");
    }, 220);
  }, interval);

  return () => window.clearInterval(timer);
}

const liveCleanups = [
  cycleFacts(document.querySelector("[data-live-ring] [data-ring-status]"), FACT_INTERVAL_MS),
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
  const stopRing = cycleFacts(ringStatus, FACT_INTERVAL_MS);
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

window.addEventListener("beforeunload", () => {
  liveCleanups.forEach((stop) => stop());
  overlayCleanup();
});
