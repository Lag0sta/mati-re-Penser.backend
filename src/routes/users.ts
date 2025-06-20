import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/users';

const router = Router();

//Création d'un nouvel utilisateur
router.post('/signup', async (req, res) => {
  try{
    //verification champs vides
    if(!req.body.pseudo || !req.body.email || !req.body.password || !req.body.name || !req.body.surname){
        res.json({ result: false, error: 'fill the fields' });
        return;
    }

    // Vérification si le compte existe déjà
    const userData = await User.findOne({
      $or: [{ pseudo: req.body.pseudo }, { email: req.body.email }],
    });
    if (userData) {
      res.json({ result: false, error: "username or @mail already used" });
      return;
    }

    // Vérification de l'adresse email
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gi;
    if (!emailRegex.test(req.body.email)) {
      res.json({ result: false, error: "invalid @mail adress" });
      return;
    }

    // Hashage du mot de passe
    const hash = bcrypt.hashSync(req.body.password, 10);

    // Création d'un nouvel utilisateur
        const newUser = new User({
          pseudo: req.body.pseudo,
          name: req.body.name,
          surname: req.body.surname,
          email: req.body.email,
          password: hash,
        });

    // Sauvegarde de l'utilisateur
    await newUser.save();
    res.json({
      result: true,
      pseudo: newUser.pseudo,
    });

  } 
  catch(error){
    console.error(error);
    res.json({ result: false, error: 'error saving user' });  }
});

export default router;