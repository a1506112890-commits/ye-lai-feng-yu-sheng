const fs = require("fs");

const file = "/app/public/noname/library/index.js";
let text = fs.readFileSync(file, "utf8");

const original = "static hallURL = '47.99.105.222';";
const replacement = "static hallURL = `wss://${location.host}:443`;";

if (text.includes(original)) {
  text = text.replace(original, replacement);
  fs.writeFileSync(file, text, "utf8");
  console.log("[patch] default online lobby -> current Render hostname (WSS/443)");
} else if (text.includes("static hallURL = `wss://${location.host}:443`;")) {
  console.log("[patch] client already patched");
} else {
  console.warn("[patch] hallURL exact source line not found. Game still runs; set the online address manually to this site's hostname if needed.");
}
