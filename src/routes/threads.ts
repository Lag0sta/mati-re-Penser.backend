import { Router } from 'express';
import Topic from '../models/topics';
import Thread from '../models/threads';
import User from '../models/users';
import Comment from '../models/comments';

import { checkToken } from '../utils/authActions';

const router = Router();

router.post('/newComment', async (req, res) => {
    console.log('➡️ [POST] /newComment');

    try {
        const { token, title, text, replyTo, replyToUser } = req.body;
        console.log('📨 Données reçues:', { tokenPresent: !!token, title, textPresent: !!text });

        const authResponse = await checkToken({ token });

        if (!authResponse.result || !authResponse.user) {
            res.json({ result: false, error: authResponse.error });
            return;
        }

        const user = authResponse.user

        console.log(`👤 Utilisateur identifié: ${user.pseudo} (${user.email})`);

        if (!text) {
            console.warn('⚠️ Champ texte vide');
            res.json({ result: false, error: 'remplissez les champs' });
            return;
        }

        const topic = await Topic.findOne({ title: title });
        if (!topic) {
            console.warn(`❌ Sujet "${title}" non trouvé`);
            res.json({ result: false, error: 'Sujet non trouvé' });
            return;
        }
        console.log(`📌 Sujet trouvé: ${topic.title} (ID: ${topic._id})`);

        const newThread = new Thread({
            topic: topic._id,
            replyTo : replyTo ? replyTo : "",
            replyToUser: replyToUser ? replyToUser : "",
            text: text,
            createdBy: user._id,
            creationDate: new Date(),
            modificationDate: new Date(),
        });

        const savedThread = await newThread.save();
        console.log('📝 Commentaire sauvegardé (ID):', savedThread._id);

        await savedThread.populate({
            path: 'createdBy',
            select: 'avatar',
        });
        console.log('🎨 Données utilisateur peuplées pour le commentaire');

        res.json({
            result: true,
            success: 'commentaire ajouté',
            newThread,
        });

    } catch (error) {
        console.error('🔥 Erreur serveur /newComment:', error);
        res.status(500).json({ result: false, error: 'Server error' });
    }
});

router.put('editComment', async (req, res) => {
        const { token, text, id } = req.body
        console.log('➡️ [PUT] /editResponse');

        const authResponse = await checkToken({ token });

        if (!authResponse.result) {
                res.json({result : false, error : authResponse.error});
                return;
            }

        const editComment = await Thread.findOneAndUpdate({ _id: id }, { text }, { new: true });

        if (!editComment) {
            console.warn('❌ Commentaire non trouvé');
            res.json({ result: false, error: 'Commentaire non trouvé' });
            return;
        }

        console.log(`✅ Commentaire modifié`);
        res.json({ result: true, success: 'Commentaire mis à jour', editComment });

    });

    router.delete('/deleteComment', async (req, res) => {
        const { token, id } = req.body
        console.log('➡️ [DELETE] /deleteComment');

        const authResponse = await checkToken({ token });

        if (!authResponse.result) {
                res.json({result : false, error : authResponse.error});
                return;
            }

        const deleteComment = await Thread.findOneAndDelete({ _id: id });

        if (!deleteComment) {
            console.warn('❌ Commentaire non rencontré');
            res.json({ result: false, error: 'Commentaire non rencontré' });
            return;
        }

        console.log(`✅ Commentaire supprimé`);
        res.json({ result: true, success: 'Commentaire supprimé' });

    })

    router.post('/newResponse', async (req, res) => {
        console.log('➡️ [POST] /newResponse');

        try {
            const { token, text, threadId } = req.body;
            console.log('📨 Données reçues:', { tokenPresent: !!token, threadId, textPresent: !!text });

            const authResponse = await checkToken({ token });

            if (!authResponse.result || !authResponse.user) {
                res.json({result : false, error : authResponse.error});
                return;
            }

            const user = authResponse.user

            console.log(`👤 Utilisateur identifié: ${user.pseudo} (${user.email})`);

            if (!text) {
                console.warn('⚠️ Champ texte vide');
                res.json({ result: false, error: 'remplissez les champs' });
                return;
            }

            const newComment = new Comment({
                thread: threadId,
                text: text,
                createdBy: user._id,
                creationDate: new Date(),
                modificationDate: new Date(),
            });

            const savedThread = await newComment.save();
            console.log('📝 Commentaire sauvegardé (ID):', savedThread._id);

            await savedThread.populate({
                path: 'createdBy',
                select: 'avatar',
            });
            console.log('🎨 Données utilisateur peuplées pour le commentaire');

            res.json({
                result: true,
                success: 'commentaire ajouté',
                newComment,
            });
 
        } catch (error) {
            console.error('🔥 Erreur serveur /newComment:', error);
            res.status(500).json({ result: false, error: 'Server error' });
        }
    });


    router.put('editResponse', async (req, res) => {
        const { token, text, id } = req.body
        console.log('➡️ [PUT] /editResponse');

        const authResponse = await checkToken({ token });

        if (!authResponse.result) {
                res.json({result : false, error : authResponse.error});
                return;
            }

        const editResponse = await Comment.findOneAndUpdate({ _id: id }, { text }, { new: true });

        if (!editResponse) {
            console.warn('❌ Commentaire non trouvé');
            res.json({ result: false, error: 'Commentaire non trouvé' });
            return;
        }

        console.log(`✅ Commentaire modifié`);
        res.json({ result: true, success: 'Commentaire mis à jour', editResponse });

    });

     router.delete('/deleteResponse', async (req, res) => {
        const { token, id } = req.body
        console.log('➡️ [DELETE] /deleteResponse');

        const authResponse = await checkToken({ token });

        if (!authResponse.result) {
                res.json({result : false, error : authResponse.error});
                return;
            }

        const deleteResponse = await Thread.findOneAndDelete({ _id: id });

        if (!deleteResponse) {
            console.warn('❌ Commentaire non rencontré');
            res.json({ result: false, error: 'Commentaire non rencontré' });
            return;
        }

        console.log(`✅ Commentaire supprimé`);
        res.json({ result: true, success: 'Commentaire supprimé' });

    })

export default router;