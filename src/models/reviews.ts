import mongoose from "mongoose";

const reviewsSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'books' },
    name: String,
    title: String,
    text: String,
    rating: Number,
    creationDate: Date,
})

const Review = mongoose.model('reviews', reviewsSchema); 

export default Review;