import { Router } from 'express';
import User from '../models/users';

const router = Router();
const bcrypt = require("bcryptjs");
const uid2 = require('uid2');


router.get('/', (req, res) => {
    User.find().then((data) => {
        res.json(data)
    })
})

//Création d'un nouvel utilisateur
router.post('/signup', async (req, res) => {
    try {
        //verification champs vides
        if (!req.body.pseudo || !req.body.email || !req.body.password || !req.body.name || !req.body.surname) {
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
    catch (error) {
        console.error('Signup error:', error);
        res.json({ result: false, error: 'error saving user' });
    }
});

//route pour la connection de l'utilisateur
router.post('/signin', async (req, res) => {
    try {
      // Vérification des champs vides
      if (!req.body.email || !req.body.password) {
        res.json({ result: false, error: 'fill the fields' });
        return;
      }

      // Recherche de l'utilisateur par email
      const userData = await User.findOne({ email: req.body.email });
      if (!userData) {
        res.json({ result: false, error: "wrong email or password" });
        return;
      }

      // Vérification du mot de passe
    const password = req.body.password;
    if (!bcrypt.compareSync(password, userData.password)) {
      res.json({ result: false, error: "wrong email or password" });
      return;
    }

    // Mettre à jour l'utilisateur avec le nouvel accessToken
        const newToken = uid2(32);
        const updatedUser = await User.findByIdAndUpdate(
          userData.id,
          { accessToken: newToken },
          { new: true }
        );

    if(!updatedUser) {
      res.json({ result: false, error: "user not found" });
      return;
    }

    // Ensuite, envoie la réponse avec les données de l'utilisateur
    res.json({
      result: true,
      pseudo: updatedUser.pseudo,
      email: updatedUser.email,
      accessToken: updatedUser.accessToken,
    });

    }
    catch (error) {
    console.error(error);
    res.json({ result: false, error: 'error signing in' });
    }
})

export default router;