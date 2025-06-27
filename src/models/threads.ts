import mongoose from "mongoose";

const threadsSchema = new mongoose.Schema({
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'topics' },
    text: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    creationDate: Date,
})

const Thread = mongoose.model('threads', threadsSchema);

export default Thread;