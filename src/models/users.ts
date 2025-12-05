import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
    avatar: String,
    pseudo: String,
    name: String,
    surname: String,
    email: String,
    password: String,
    accessToken: String,
    submits:[{ type: mongoose.Schema.Types.ObjectId }],
    isAdmin: Boolean,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
})

const User = mongoose.model('users', usersSchema);

export default User;