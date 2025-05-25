export function debug_log(msg) {
  console.log("[DEBUG] " + msg);
  try {
    const p = document.createElement("p");
    p.textContent = "[DEBUG] " + msg;
    p.style.color = "lime";
    document.body.appendChild(p);
  } catch (_) {}
}
