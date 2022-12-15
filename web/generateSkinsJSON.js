const fs = require("fs");
const content = fs.readdirSync("./skins").map(skin => {
  let temp = skin.split(".");
  temp.pop();
  return temp.join(".")
});
fs.writeFileSync(
  "./skins.json",
  JSON.stringify(content)
)