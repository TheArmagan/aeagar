const a = require("fs"); const b = a.readdirSync("./skins").map(c => { let d = c.split("."); d.pop(); return d.join(".") }); a.writeFileSync("./skins.json", JSON.stringify(b));