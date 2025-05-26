export function debug_log(message) {
  const logArea = document.getElementById("log");
  if (logArea) {
    const line = document.createElement("div");
    line.textContent = "[debug] " + message;
    logArea.appendChild(line);
  } else {
    console.log("[debug] " + message);
  }
}
