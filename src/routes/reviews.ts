import { Router } from 'express';
import Review from '../models/reviews';
import { validate } from "../middlewares/validate";
import { newReviewSchema } from "../schemas/reviews.schema";

const router = Router();

//route pour envoyer un avis
router.post('/newReview', validate(newReviewSchema), async (req, res) => {
  const { name, title, text, rating } = req.body;

  if(!name || !title || !text ){
    res.json({result: false, message: '❌ veuillez remplir tous les champs'})
    return
  } 
  
  if(!rating || rating < 1 || rating > 5){
    res.json({result: false, message: '❌ la note doit etre comprise entre 1 et 5'})
    return
  }
    
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
