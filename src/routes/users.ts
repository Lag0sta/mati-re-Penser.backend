import { Router } from 'express';
import User from '../models/users';

const router = Router();
const bcrypt = require("bcryptjs");

router.get('/', (req, res) => {
  User.find().then((data) => {
    res.json(data)
  })
})

//Création d'un nouvel utilisateur
router.post('/signup', async (req, res) => {
  try {
    const { pseudo, email, password, confirmPassword,name, surname } = req.body;
    //verification champs vides
    if (!pseudo || !email || !password || !name || !surname) {
      res.json({ result: false, error: 'remplissez les champs' });
      return;
    }

    // Vérification si le compte existe déjà
    const userData = await User.findOne({
      $or: [{ pseudo: pseudo }, { email: email }],
    });
    if (userData) {
      res.json({ result: false, error: "nom d'utilisateur ou  @mail déja utilisé" });
      return;
    }

    // Vérification de l'adresse email
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gi;
    if (!emailRegex.test(email)) {
      res.json({ result: false, error: "adresse @mail invalide" });
      return;
    }

    //vérifications que les mots de passe correspondent
    if (password !== confirmPassword) {
        res.json({ result: false, error: "Les mots de passe ne correspondent pas"});

        return
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
      success: 'utilisateur créé avec succès',
      pseudo: newUser.pseudo,
    });

  }
  catch (error) {
    res.json({ result: false, error: "erreur en sauvegarde de l'utilisateur" });
  }
});

//route pour modifier l'avatar
router.put('/avatar', async (req, res) => {
  try {
    const { avatar, token } = req.body;
    if (!token) {
      res.status(401).json({ result: false, error: 'connectez-vous' });
      return
    }

    if (!avatar) {
      res.json({ result: false, error: 'choisissez un avatar' });
      return;
    }

    const user = await User.findOneAndUpdate({ accessToken: token },
      { avatar: avatar },
      { new: true }
    )

    if (!user) {
      res.status(404).json({ result: false, error: 'Utilisateur non trouvé' });
      return
    }

    res.json({ result: true, success: 'avatar modifié', avatar: user.avatar });

  }
  catch (error) {
    console.error(error);
    res.json({ result: false, error: 'erreur lors de la connection' });
  }
})
export default router;