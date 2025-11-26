import { Router } from 'express';
import Review from '../models/reviews';

const router = Router();

router.post('/newReview', async (req, res) => {
  const { name, mail, title, text } = req.body;

  if(!name || !mail || !title || !text){
    res.json({result : false, message: 'Veuillez remplir tous les champs'})
    return
  }
    
     const newReview = new Review({
      name: name,
      mail: mail,
      title: title,
      creationDate: new Date(),
      text: text,
    })
    
    const savedReview = await newReview.save();
    res.json({result: true, message: 'Avis envoyé' , review: savedReview})
})

export default router;
