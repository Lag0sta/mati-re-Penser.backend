import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema({
    thread: { type: mongoose.Schema.Types.ObjectId, ref: 'threads' },
    text: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    creationDate: Date,
    modificationDate: Date,
})

const Comment = mongoose.model('comments', commentsSchema);

export default Comment;