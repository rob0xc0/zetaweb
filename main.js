//should import all modules and orchestrate them
import { config } from "dotenv";
config()

import { activate_discord_bot } from "./source/interface/discord/bot/bot.js";

activate_discord_bot();
