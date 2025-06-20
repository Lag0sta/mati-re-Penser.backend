"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const connection_1 = require("./models/connection");
dotenv_1.default.config();
const string = process.env.CONNECTION_STRING || '';
(0, connection_1.connectToDatabase)(string).then(() => {
    app_1.default.listen(4000, () => {
        console.log(`🚀 Server running on http://localhost:4000`);
    });
});
