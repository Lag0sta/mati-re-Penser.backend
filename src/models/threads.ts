import mongoose from "mongoose";

const threadsSchema = new mongoose.Schema({
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'topics' },
    replyTo: String,
    replyToUser: String,
    text: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    creationDate: Date,
    modificationDate: Date,
})

const Thread = mongoose.model('threads', threadsSchema);

export default Thread;