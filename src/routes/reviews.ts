import { Router } from 'express';
import Review from '../models/reviews';
import User from '../models/users';
import { validate } from "../middlewares/validate";
import { newReviewSchema, reviewsSchema, deleteReviewSchema } from "../schemas/reviews.schema";

import { checkToken } from '../utils/authActions';

const bcrypt = require("bcryptjs");


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

 router.delete('/deleteReview', validate(deleteReviewSchema), async (req, res) => {
        const { token, id, pseudo, password } = req.body
        const authResponse = await checkToken({ token });

        if (!authResponse.result) {
                res.json({result : false, message : authResponse.error});
                return;
        }
console.log("pseudo reçu:", pseudo)
        const userAuth = await User.findOne({pseudo})

        if (!userAuth) {
            res.json({ result: false, message: '❌ Utilisateur non rencontré' });
            return;
        }

        if(!userAuth.isAdmin) {
            res.json({ result: false, message: '❌ Utilisateur non autorisé' });
            return;
        }

        if(!bcrypt.compareSync(password, userAuth.password)) {
            res.json({ result: false, message: "mauvais identifiants" });
            return;
        }

        const deleteReview = await Review.findOneAndDelete({ _id: id });

        if (!deleteReview) {
            res.json({ result: false, message: 'Avis non rencontré' });
            return;
        }

        res.json({ result: true, message: 'Avis supprimé' });
    })

export default router;
