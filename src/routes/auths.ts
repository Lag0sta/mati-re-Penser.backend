
import { Router } from 'express';
import User from '../models/users';

const router = Router();
const bcrypt = require("bcryptjs");
const uid2 = require('uid2');

//route pour la connection de l'utilisateur
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Vérification des champs vides
        if (!email || !password) {
            res.json({ result: false, error: 'remplissez les champs' });
            return;
        }

        // Recherche de l'utilisateur par email
        const userData = await User.findOne({ email: email });
        if (!userData || !bcrypt.compareSync(password, userData.password)) {
            res.json({ result: false, error: "mauvais identifiants" });
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
            res.json({ result: false, error: "utilisateur non trouvé" });
            return;
        }

        // Ensuite, envoie la réponse avec les données de l'utilisateur
        res.json({
            result: true,
            success: `Bonjour ${updatedUser.pseudo}`,
            avatar: updatedUser.avatar,
            pseudo: updatedUser.pseudo,
            email: updatedUser.email,
            accessToken: updatedUser.accessToken,
        });

    }
    catch (error) {
        console.error(error);
        res.json({ result: false, error: 'erreur de connection' });
    }
})


//route pour une 2e auth pour modification sensibles
router.post('/auth', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token) {
            res.status(401).json({ result: false, error: 'Veuillez vous connecter' })
            return
        }

        if (!password) {
            res.status(400).json({ result: false, error: 'Veuillez remplir tous les champs' });
            return
        }

        const user = await User.findOne({ accessToken: token })

        if (!user) {
            res.status(404).json({ result: false, error: 'Utilisateur introuvable' });
            return
        }

        //comparaison du mot de passe
        const isMatch = await bcrypt.compare(password, user?.password);
        if (!isMatch) {
            res.status(401).json({ result: false, error: 'Mot de passe incorrect' });
            return
        }

        //Auth ok
        res.json({ result: true, success: 'Authentification réussie' });

    } catch (error) {
        console.error(error);
        res.json({ result: false, error: 'Erreur interne du serveur' });
        return
    }

})

export default router;