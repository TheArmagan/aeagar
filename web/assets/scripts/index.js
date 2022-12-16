import "./game.js";
import "./interface.js";

import * as connection from "./connection.js";
import "./connection-handlers.js";
import "./controls.js";

let u = new URL(window.location.href);
connection.connect(u.searchParams.get("s") || "local6780.armagan.rest");
