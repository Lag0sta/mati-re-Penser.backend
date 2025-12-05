import { Router } from 'express';
import Review from '../models/reviews';
import { validate } from "../middlewares/validate";
import { newReviewSchema } from "../schemas/reviews.schema";

const router = Router();

//route pour envoyer un avis
router.post('/newReview', validate(newReviewSchema), async (req, res) => {
  const { name, title, text, rating } = req.body;
  
     const newReview = new Review({
      name: name,
      title: title,
      creationDate: new Date(),
      text: text,
      rating: rating
    })
    
    const savedReview = await newReview.save();
    res.json({result: true, message: 'Avis envoyé' , review: savedReview})
})

export default router;
