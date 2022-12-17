import "./game.js";
import "./interface.js";

import * as connection from "./connection.js";
import "./connection-handlers.js";
import "./controls.js";
import { WS_SERVER } from "./constants.js";

let u = new URL(window.location.href);
connection.connect(u.searchParams.get("s") || WS_SERVER);
