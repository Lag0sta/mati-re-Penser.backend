import { Router } from 'express';
import Review from '../models/reviews';
import { validate } from "../middlewares/validate";
import { newReviewSchema } from "../schemas/reviews.schema";

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

export default router;
