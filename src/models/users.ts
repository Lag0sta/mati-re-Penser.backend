import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
    pseudo: String,
    name: String,
    surname: String,
    email: String,
    password: String,
    accessToken: String,
    submits:[],
    resetPasswordToken: String,
    resetPasswordExpires: Date
})

const User = mongoose.model('users', usersSchema);

export default User;