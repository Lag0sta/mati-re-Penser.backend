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
    const { pseudo, email, password, name, surname } = req.body;
    //verification champs vides
    if (!pseudo || email || password || name || surname) {
      res.json({ result: false, error: 'fill the fields' });
      return;
    }

    // Vérification si le compte existe déjà
    const userData = await User.findOne({
      $or: [{ pseudo: pseudo }, { email: email }],
    });
    if (userData) {
      res.json({ result: false, error: "username or @mail already used" });
      return;
    }

    // Vérification de l'adresse email
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gi;
    if (!emailRegex.test(email)) {
      res.json({ result: false, error: "invalid @mail adress" });
      return;
    }

    // Hashage du mot de passe
    const hash = bcrypt.hashSync(password, 10);

    // Création d'un nouvel utilisateur
    const newUser = new User({
      pseudo: pseudo,
      name: name,
      surname: surname,
      email: email,
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
    const { email, password } = req.body;
    // Vérification des champs vides
    if (!email || !password) {
      res.json({ result: false, error: 'fill the fields' });
      return;
    }

    // Recherche de l'utilisateur par email
    const userData = await User.findOne({ email: email });
    if (!userData) {
      res.json({ result: false, error: "wrong email or password" });
      return;
    }

    // Vérification du mot de passe
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

    if (!updatedUser) {
      res.json({ result: false, error: "user not found" });
      return;
    }

    // Ensuite, envoie la réponse avec les données de l'utilisateur
    res.json({
      result: true,
      avatar: updatedUser.avatar,
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

//route pour modifier l'avatar
router.put('/avatar', async (req, res) => {
  try {
    const { avatar, token } = req.body;
    if (!token) {
      res.status(401).json({ result: false, error: 'please Login' });
      return
    }

    if (!avatar) {
      res.json({ result: false, error: 'select an avatar' });
      return;
    }

    const user = await User.findOneAndUpdate({ accessToken: token },
      { avatar: avatar },
      { new: true }
    )

    if (!user) {
      res.status(404).json({ result: false, error: 'User not found' });
      return
    }

    res.json({ result: true, avatar: user.avatar });

  }
  catch (error) {
    console.error(error);
    res.json({ result: false, error: 'error signing in' });
  }
})
export default router;