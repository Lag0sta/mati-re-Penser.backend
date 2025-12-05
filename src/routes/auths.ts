
import { Router } from 'express';
import User from '../models/users';
import { validate } from "../middlewares/validate";
import { signInSchema, authSchema, logoutSchema } from "../schemas/auths.schema";

import { checkToken } from '../utils/authActions';

const router = Router();
const bcrypt = require("bcryptjs");
const uid2 = require('uid2');

//route pour la connection de l'utilisateur
router.post('/signin', validate(signInSchema), async (req, res) => {
    console.log('➡️ [POST] /signin');

    try {
        const { email, password } = req.body;
        console.log('📨 Reçu:', { email });

        const userData = await User.findOne({ email: email });

        if (!userData || !bcrypt.compareSync(password, userData.password)) {
            res.json({ result: false, message: "mauvais identifiants" });
            return;
        }

        const newToken = uid2(32);
        const updatedUser = await User.findByIdAndUpdate(
            userData.id,
            { accessToken: newToken },
            { new: true }
        );

        if (!updatedUser) {
            res.json({ result: false, message: "utilisateur non trouvé" });
            return;
        }

        console.log(`✅ Connexion réussie pour ${updatedUser.email}`);

        res.json({
            result: true,
            message: `Bonjour ${updatedUser.pseudo}`,
            id: updatedUser.id,
            avatar: updatedUser.avatar,
            pseudo: updatedUser.pseudo,
            email: updatedUser.email,
            accessToken: updatedUser.accessToken,
            isAdmin: updatedUser.isAdmin,
        });

    } catch (error) {
        console.error('🔥 Erreur interne /signin:', error);
        res.json({ result: false, message: 'erreur de connection' });
    }
});

//route pour une 2e auth pour modification sensibles
router.post('/auth', validate(authSchema), async (req, res) => {
    console.log('➡️ [POST] /auth');

    try {
        const { token, password } = req.body;
        console.log('📨 Token reçu:', token ? 'oui' : 'non');

        const authResponse = await checkToken({ token });

        if (!authResponse.result || !authResponse.user) {
            res.json({ result: false, message: authResponse.error });
            return;
        }

        const user = authResponse.user

        const isMatch = await bcrypt.compare(password, user?.password);
        if (!isMatch) {
            console.warn(`❌ Mot de passe incorrect pour ${user.email}`);
            res.json({ result: false, message: 'Mot de passe incorrect' });
            return;
        }

        console.log(`✅ Authentification réussie pour ${user.email}`);
        res.json({ result: true, message: 'Authentification réussie' });

    } catch (error) {
        console.error('🔥 Erreur interne /auth:', error);
        res.json({ result: false, message: 'Erreur interne du serveur' });
    }
});

//route pour la deconnexion
router.put('/logout', validate(logoutSchema), async (req, res) => {
    console.log('➡️ [PUT] /logout');
    const { token, id } = req.body
    try {
        const logOut = await User.findOneAndUpdate({ _id: id, accessToken: token }, { accessToken: "" }, { new: true });

        if (!logOut) {
            res.json({ result: false, message: "Utilisateur non trouvé ou déjà déconnecté" });
            return
        }

        res.json({ result: true, message: "Deconnexion reussie" });

    } catch (error) {
        console.error('🔥 Erreur interne /logout:', error);
        res.json({ result: false, message: 'Erreur interne du serveur' });
    }
})

export default router;