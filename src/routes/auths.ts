
import { Router } from 'express';
import User from '../models/users';

const router = Router();
const bcrypt = require("bcryptjs");
const uid2 = require('uid2');

//route pour la connection de l'utilisateur
router.post('/signin', async (req, res) => {
    console.log('➡️ [POST] /signin');

    try {
        const { email, password } = req.body;
        console.log('📨 Reçu:', { email });

        if (!email || !password) {
            console.warn('⚠️ Champs manquants');
            res.json({ result: false, error: 'remplissez les champs' });
            return;
        }

        const userData = await User.findOne({ email: email });
        if (!userData) {
            console.warn('❌ Utilisateur non trouvé');
        }

        if (!userData || !bcrypt.compareSync(password, userData.password)) {
            console.warn('❌ Identifiants incorrects');
            res.json({ result: false, error: "mauvais identifiants" });
            return;
        }

        const newToken = uid2(32);
        const updatedUser = await User.findByIdAndUpdate(
            userData.id,
            { accessToken: newToken },
            { new: true }
        );

        if (!updatedUser) {
            console.error('❌ Mise à jour accessToken échouée');
            res.json({ result: false, error: "utilisateur non trouvé" });
            return;
        }

        console.log(`✅ Connexion réussie pour ${updatedUser.email}`);

        res.json({
            result: true,
            success: `Bonjour ${updatedUser.pseudo}`,
            avatar: updatedUser.avatar,
            pseudo: updatedUser.pseudo,
            email: updatedUser.email,
            accessToken: updatedUser.accessToken,
        });

    } catch (error) {
        console.error('🔥 Erreur interne /signin:', error);
        res.json({ result: false, error: 'erreur de connection' });
    }
});



//route pour une 2e auth pour modification sensibles
router.post('/auth', async (req, res) => {
    console.log('➡️ [POST] /auth');

    try {
        const { token, password } = req.body;
        console.log('📨 Token reçu:', token ? 'oui' : 'non');

        if (!token) {
            console.warn('⚠️ Aucun token');
            res.status(401).json({ result: false, error: 'Veuillez vous connecter' });
            return;
        }

        if (!password) {
            console.warn('⚠️ Mot de passe manquant');
            res.status(400).json({ result: false, error: 'Veuillez remplir tous les champs' });
            return;
        }

        const user = await User.findOne({ accessToken: token });

        if (!user) {
            console.warn('❌ Token invalide ou utilisateur introuvable');
            res.status(404).json({ result: false, error: 'Utilisateur introuvable' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user?.password);
        if (!isMatch) {
            console.warn(`❌ Mot de passe incorrect pour ${user.email}`);
            res.status(401).json({ result: false, error: 'Mot de passe incorrect' });
            return;
        }

        console.log(`✅ Authentification réussie pour ${user.email}`);
        res.json({ result: true, success: 'Authentification réussie' });

    } catch (error) {
        console.error('🔥 Erreur interne /auth:', error);
        res.json({ result: false, error: 'Erreur interne du serveur' });
    }
});


export default router;