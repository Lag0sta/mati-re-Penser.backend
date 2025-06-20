"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectToDatabase(connectionString) {
    try {
        await mongoose_1.default.connect(connectionString, { connectTimeoutMS: 2000 });
        console.log('✅ Data Connected');
        return mongoose_1.default;
    }
    catch (error) {
        console.error('❌ Error connection failed:', error);
        return error;
    }
}
