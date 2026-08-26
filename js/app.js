const RING_FACTS = [
  "Лизинг не замораживает всю сумму: покупка уже у вас, деньги остаются в обороте.",
  "Наличными вы платите 100% сразу. В лизинге — аванс, остальное удобными платежами.",
  "Пока копите наличными, цена может вырасти. Лизинг фиксирует условия сегодня.",
  "Лизинг — это способ распределить расходы во времени без необходимости копить всю сумму сразу.",
  "Финансовые цели достигаются быстрее, когда есть чёткий план платежей.",
  "Фиксированный платёж проще планировать, чем откладывать нужную покупку.",
];

const LAST_FACT_KEY = "fc-b2c-last-fact";
const overlay = document.getElementById("overlay");
const overlayPanel = overlay.querySelector("[data-overlay-panel]");

function shuffle(items) {
  const bag = [...items];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

function readLastFact() {
  try {
    return sessionStorage.getItem(LAST_FACT_KEY);
  } catch {
    return null;
  }
}

function writeLastFact(fact) {
  try {
    sessionStorage.setItem(LAST_FACT_KEY, fact);
  } catch {
    /* private mode */
  }
}

function createFactBag(values) {
  let remaining = [];
  let last = readLastFact();

  function refill() {
    remaining = shuffle(values);
    if (last && remaining.length > 1 && remaining[0] === last) {
      const swap = 1 + Math.floor(Math.random() * (remaining.length - 1));
      [remaining[0], remaining[swap]] = [remaining[swap], remaining[0]];
    }
  }

  function next() {
    if (!remaining.length) refill();
    last = remaining.shift();
    writeLastFact(last);
    return last;
  }

  return { next };
}

function cycleFacts(node, interval) {
  if (!node) return () => {};
  const bag = createFactBag(RING_FACTS);
  node.textContent = bag.next();

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
  cycleFacts(document.querySelector("[data-live-ring] [data-ring-status]"), 4500),
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
  const stopRing = cycleFacts(ringStatus, 4500);
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
