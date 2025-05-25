export function debug_log(message) {
  console.log("[debug]", message);
  if (window.debug_log) {
    window.debug_log(message);
  }
}
