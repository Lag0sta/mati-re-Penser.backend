import mongoose from "mongoose";

const reviewsSchema = new mongoose.Schema({
    name: String,
    title: String,
    creationDate: Date,
    text: String,
    rating: Number,
})

const Review = mongoose.model('reviews', reviewsSchema); 

export default Review;