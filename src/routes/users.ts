import { Router } from 'express';
import User from '../models/users';

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
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    const { pseudo, email, password, confirmPassword, name, surname, hp } = req.body;
    console.log('➡️ [POST] /signup - Tentative de création de compte');

    if (hp && hp.trim() !== "") {
     res.json({ success: false, reason: "Bot détecté" });
     return
  }

    if (!pseudo || !email || !password || !name || !surname) {
      console.warn('⚠️ Champs manquants');
      res.json({ result: false, error: 'remplissez les champs' });
      return;
    }

    //vérification de syntaxe du mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) {
      console.warn('⚠️ Email invalide');
      res.json({ result: false, error: "adresse @mail invalide" });
      return;
    }
    
    //vérification du MX
    if (!(await hasValidMX(email))) {
      res.json({ success: false, reason: "Domaine email invalide" });
      return
    }

    const userData = await User.findOne({
      $or: [{ pseudo: pseudo }, { email: email }],
    });
    if (userData) {
      console.warn("⚠️ Utilisateur ou email déjà existant");
      res.json({ result: false, error: "nom d'utilisateur ou  @mail déja utilisé" });
      return;
    }

    

    if (password !== confirmPassword) {
      console.warn('⚠️ Mots de passe non correspondants');
      res.json({ result: false, error: "Les mots de passe ne correspondent pas" });
      return;
    }

    const hash = bcrypt.hashSync(password, 10);
    console.log('🔐 Mot de passe hashé');

    const newUser = new User({
      pseudo,
      name,
      surname,
      email,
      password: hash,
    });

    await newUser.save();
    console.log(`✅ Nouvel utilisateur créé : ${newUser.pseudo}`);

    res.json({
      result: true,
      success: 'utilisateur créé avec succès',
      pseudo: newUser.pseudo,
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement de l'utilisateur :", error);
    res.json({ result: false, error: "erreur en sauvegarde de l'utilisateur" });
  }
});

// Route pour modifier l'avatar
router.put('/avatar', async (req, res) => {
  try {
    const { avatar, token } = req.body;
    console.log('➡️ [PUT] /avatar - Modification de l\'avatar');

    const authResponse = await checkToken({ token });
    
            if (!authResponse.result || !authResponse.user) {
                res.json({result : false, error : authResponse.error});
                return;
            }
    
    if (!avatar) {
      console.warn('⚠️ Avatar non fourni');
      res.json({ result: false, error: 'choisissez un avatar' });
      return;
    }

    const user = await User.findOneAndUpdate({ accessToken: token },
      { avatar: avatar },
      { new: true }
    );

    if (!user) {
      console.warn('⚠️ Utilisateur non trouvé');
      res.status(404).json({ result: false, error: 'Utilisateur non trouvé' });
      return;
    }

    console.log(`✅ Avatar mis à jour pour ${user.pseudo}`);
    res.json({ result: true, success: 'avatar modifié', avatar: user.avatar });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'avatar :', error);
    res.json({ result: false, error: 'erreur lors de la connection' });
  }
});

export default router;
