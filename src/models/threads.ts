import mongoose from "mongoose";

const threadsSchema = new mongoose.Schema({
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'topics' },
    text: String,
    quote:  [mongoose.Schema.Types.ObjectId], //tableau d'_id 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    creationDate: Date,
    modificationDate: Date,
})

const Thread = mongoose.model('threads', threadsSchema);

export default Thread;