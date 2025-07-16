import { Router } from 'express';
import Topic from '../models/topics';
import Thread from '../models/threads';
import User from '../models/users';
import { resolve } from 'node:path/win32';

const router = Router();

//route pour ajouter un nouveau commentaire au Topic
router.post('/newComment', async (req, res) => {
    try {
        const { token, title, text } = req.body;
        if (!token) {
            res.json({ result: false, error: 'connectez-vous' })
            return
        }

        //récupération iD de l'utilisateur
        const user = await User.findOne({ accessToken: token })

        if (!user) {
            res.json({ result: false, error: 'utilisateur non trouvé' })
            return
        }

        //vérification des champs vide
        if (!text) {
            res.json({ result: false, error: 'remplissez les champs' });
            return;
        }

        //vérification du topic
        const topic = await Topic.findOne({ title: title })

        if (!topic) {
            res.json({ result: false, error: 'Sujet non trouvé' });
            return;
        }

        //post du commentaire
        const newThread = new Thread({
            topic: topic?._id,
            text: text,
            createdBy: user?._id,
            creationDate: new Date()
        })

        const savedThread = await newThread.save()

        await savedThread.populate({
            path: 'createdBy',
            select: 'avatar',    // ou 'avatar pseudo' si tu veux aussi le pseudo
        });

        res.json({ result: true, success: 'commentaire ajouté', newThread })

    } catch (error) {
        res.status(500).json({ result: false, message: 'Server error' });
    }
})

export default router;