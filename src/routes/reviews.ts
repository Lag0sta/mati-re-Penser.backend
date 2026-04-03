import { Router } from 'express';
import Review from '../models/reviews';
import { validate } from "../middlewares/validate";
import { newReviewSchema, reviewsSchema } from "../schemas/reviews.schema";

const router = Router();

//route pour envoyer un avis
router.post('/newReview', validate(newReviewSchema), async (req, res) => {
  const { name, title, text, rating, book } = req.body;

  const newReview = new Review({
    book: book,
    name: name,
    title: title,
    text: text,
    rating: rating,
    creationDate: new Date()
  })

  const savedReview = await newReview.save();
  res.json({ result: true, message: 'Avis envoyé', review: savedReview })
})

router.post('/reviews', validate(reviewsSchema), async (req, res) => {
  const { id } = req.body;

  Review.find({ book: id }).then((data) => {
    res.json({ result: true, message: 'Avis envoyés', reviews: data })
  })
})

export default router;
