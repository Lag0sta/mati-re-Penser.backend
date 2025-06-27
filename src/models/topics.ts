import mongoose from "mongoose";

const topicsSchema = new mongoose.Schema({
    title: String,
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    creationDate: Date,
})

const Topic = mongoose.model('topics', topicsSchema);

export default Topic;