import mongoose from "mongoose";

const booksSchema = new mongoose.Schema({
    titre: String,
    text: String,
    img: String,
    avis: [{author: String, text: String}],
    lien: String,
    creationDate: Date,
    isArchived: Boolean
})

const Book = mongoose.model('books', booksSchema);

export default Book;