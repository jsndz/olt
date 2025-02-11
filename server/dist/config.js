"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANTHROPIC_API_KEY = exports.PORT = void 0;
require("dotenv").config();
exports.PORT = process.env.PORT;
exports.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
