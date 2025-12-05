import { Router } from 'express';
import User from '../models/users';

import { validate } from "../middlewares/validate";
import { signUpSchema, avatarSchema } from "../schemas/users.schema";

import rateLimit from "express-rate-limit";
import dns from "dns/promises";

import { checkToken } from '../utils/authActions';

const router = Router();
const bcrypt = require("bcryptjs");

router.get('/', (req, res) => {
  console.log('➡️ [GET] /users - Récupération des utilisateurs');
  User.find().then((data) => {
    console.log(`✅ ${data.length} utilisateurs récupérés`);
    res.json(data);
  }).catch(error => {
    console.error('❌ Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({ result: false, error: 'Erreur serveur' });
  });
});

// 1Configuration du rate limiter
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 inscriptions max par IP
  message: { success: false, reason: "Trop de tentatives, réessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

//Vérification MX
async function hasValidMX(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
}

// Création d'un nouvel utilisateur
router.post('/signup', validate(signUpSchema), signupLimiter, async (req, res) => {
  try {
    const { pseudo, email, password, confirmPassword, name, surname, hp } = req.body;

    //vérification de bot
    if (hp && hp.trim() !== "") {
      res.json({ success: false, reason: "Bot détecté" });
      return
    }

    //vérification de syntaxe du mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) {
      res.json({ result: false, error: "⚠️ adresse @mail invalide" });
      return;
    }

    //vérification du MX
    if (!(await hasValidMX(email))) {
      res.json({ success: false, reason: "Domaine email invalide" });
      return
    }

    //vérification de doublons
    const userData = await User.findOne({
      $or: [{ pseudo: pseudo }, { email: email }],
    });
    if (userData) {
      res.json({ result: false, error: "⚠️ nom d'utilisateur ou  @mail déja utilisé" });
      return;
    }

    //vérification du mot-de-passe
    if (password !== confirmPassword) {
      res.json({ result: false, error: "⚠️ Les mots de passe ne correspondent pas" });
      return;
    }

    //sécurisation du mot-de-passe
    const hash = bcrypt.hashSync(password, 10);

    const newUser = new User({
      pseudo,
      name,
      surname,
      email,
      password: hash,
      isAdmin: false,
    });

    await newUser.save();

    res.json({
      result: true,
      success: '✅ utilisateur créé avec succès',
      pseudo: newUser.pseudo,
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement de l'utilisateur :", error);
    res.json({ result: false, error: "erreur en sauvegarde de l'utilisateur" });
  }
});

// Route pour modifier l'avatar
router.put('/avatar', validate(avatarSchema), async (req, res) => {
  try {
    const { avatar, token } = req.body;
    console.log('➡️ [PUT] /avatar - Modification de l\'avatar');

    const authResponse = await checkToken({ token });

    if (!authResponse.result || !authResponse.user) {
      res.json({ result: false, error: authResponse.error });
      return;
    }

    const user = await User.findOneAndUpdate({ accessToken: token },
      { avatar: avatar },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ result: false, error: '⚠️ Utilisateur non trouvé' });
      return;
    }

    res.json({ result: true, success: `✅ Avatar mis à jour pour ${user.pseudo}`, avatar: user.avatar });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'avatar :', error);
    res.json({ result: false, error: 'erreur lors de la connection' });
  }
});

export default router;
