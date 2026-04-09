import { Router } from 'express';
import Topic from '../models/topics';
import Thread from '../models/threads';
import { validate } from "../middlewares/validate";
import { newCommentSchema, editCommentSchema, deleteCommentSchema } from "../schemas/threads.schema";

import { checkToken } from '../utils/authActions';
const bcrypt = require("bcryptjs");
import User from '../models/users';

const router = Router();

//route pour envoyer un nouveau commentaire dans le topic d'un forum
router.post('/newComment', validate(newCommentSchema), async (req, res) => {
    console.log('➡️ [POST] /newComment');

    try {
        const { token, title, text, quote } = req.body;

        const authResponse = await checkToken({ token });

        if (!authResponse.result || !authResponse.user) {
            res.json({ result: false, error: authResponse.error });
            return;
        }

        const user = authResponse.user

        const topic = await Topic.findOne({ title: title });
        if (!topic) {
            res.json({ result: false, error: 'Sujet non trouvé' });
            return;
        }

        const newThread = new Thread({
            topic: topic._id,
            text: text,
            quote: quote,
            createdBy: user._id,
            creationDate: new Date(),
            modificationDate: new Date(),
        });

        const savedThread = await newThread.save();

        await savedThread.populate({
            path: 'createdBy',
            select: 'avatar pseudo',
        });

        res.json({
            result: true,
            success: 'commentaire ajouté',
            newThread,
        });

    } catch (error) {
        res.status(500).json({ result: false, error: error });
    }
});

router.put('/editComment', validate(editCommentSchema), async (req, res) => {
        const { token, text, id } = req.body

        const authResponse = await checkToken({ token });

        if (!authResponse.result) {
                res.json({result : false, message : authResponse.error});
                return;
            }

        const editedComment = await Thread.findOneAndUpdate({ _id: id }, { text }, { new: true });

        if (!editedComment) {
            res.json({ result: false, message: '❌ Commentaire non trouvé' });
            return;
        }

        res.json({ result: true, message: '✅ Commentaire mis à jour ', editedComment });

    });

    router.delete('/deleteComment', validate(deleteCommentSchema), async (req, res) => {
        const { token, id, pseudo, password } = req.body
        const authResponse = await checkToken({ token });

        if (!authResponse.result) {
                res.json({result : false, message : authResponse.error});
                return;
        }
console.log("pseudo reçu:", pseudo)
        const userAuth = await User.findOne({pseudo})

        if (!userAuth) {
            res.json({ result: false, message: '❌ Utilisateur non rencontré' });
            return;
        }

        if(!userAuth.isAdmin) {
            res.json({ result: false, message: '❌ Utilisateur non autorisé' });
            return;
        }

        if(!bcrypt.compareSync(password, userAuth.password)) {
            res.json({ result: false, message: "mauvais identifiants" });
            return;
        }

        const deleteComment = await Thread.findOneAndDelete({ _id: id });

        if (!deleteComment) {
            res.json({ result: false, message: 'Commentaire non rencontré' });
            return;
        }

        res.json({ result: true, message: 'Commentaire supprimé' });
    })

export default router;