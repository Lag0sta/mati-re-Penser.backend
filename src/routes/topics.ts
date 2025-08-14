import { Router } from 'express';
import Topic from '../models/topics';
import Thread from '../models/threads';
import User from '../models/users';
import Comment from '../models/comments';

import { checkToken } from '../utils/authActions';
import { error } from 'console';

const router = Router();

router.get('/', (req, res) => {
    console.log('➡️ [GET] / - Récupération de tous les topics');
    Topic.find().then((data) => {
        console.log(`✅ ${data.length} topics récupérés`);
        res.json(data);
    });
});

router.post('/newTopic', async (req, res) => {
    console.log('➡️ [POST] /newTopic');
    try {
        const { token, title, description } = req.body;

        const authResponse = await checkToken({ token });

        if (!authResponse.result || !authResponse.user) {
            res.json({result : false, error : authResponse.error});
            return;
        }

        const user = authResponse.user

        if (!title || !description) {
            console.warn('❌ Champs vides');
            res.json({ result: false, error: 'Veuillez remplir tous les champs' });
            return;
        }

        const topic = await Topic.findOne({ title: title });

        if (topic) {
            console.warn('❌ Sujet déjà existant');
            res.json({ result: false, error: 'Sujet déja existant' });
            return;
        }

        const newTopic = new Topic({
            title,
            description,
            isLocked: false,
            createdBy: user._id,
            creationDate: new Date(),
        });

        await newTopic.save();
        console.log(`✅ Nouveau sujet créé: ${title}`);
        res.json({ result: true, newTopic, success: `✅ Nouveau sujet créé: ${title}` });

    } catch (error) {
        console.error('❌ Erreur serveur lors de la création d’un sujet:', error);
        res.status(500).json({ result: false, error: 'Erreur de Serveur' });
    }
});

router.get('/topicsWithThreadCounts', async (req, res) => {
    console.log('➡️ [GET] /topicsWithThreadCounts');
    try {
        const topics = await Topic.find();
        const threadCounts = await Thread.aggregate([
            { $group: { _id: '$topic', count: { $sum: 1 } } }
        ]);
        const lastModifiedDates = await Thread.aggregate([
            { $group: { _id: "$topic", lastModified: { $max: "$creationDate" } } }
        ]);

        const lastModifiedMap: Record<string, Date> = {};
        lastModifiedDates.forEach(item => {
            lastModifiedMap[item._id.toString()] = item.lastModified;
        });

        const countMap: Record<string, number> = {};
        threadCounts.forEach(tc => {
            countMap[tc._id.toString()] = tc.count;
        });

        const threadsInTopic = topics.map(topic => ({
            ...topic.toObject(),
            threadCount: countMap[topic._id.toString()] || 0,
            lastModified: lastModifiedMap[topic._id.toString()]
        }));

        console.log(`✅ ${threadsInTopic.length} commentaires retournés`);
        res.json({ threadsInTopic, success: `✅ ${threadsInTopic.length} sujets trouvés` });
    } catch (error) {
        console.error('❌ Erreur serveur:', error);
        res.status(500).json({ result: false, error: 'Erreur de serveur' });
    }
});

router.post('/topicContent', async (req, res) => {
    console.log('➡️ [POST] /topicContent');
    try {
        const { title } = req.body;
        const topic = await Topic.findOne({ title: title }).populate({
            path: 'createdBy',
            select: 'pseudo avatar'
        });

        if (!topic) {
            console.warn('❌ Sujet non trouvé');
            res.json({ result: false, error: 'Sujet non trouvé' });
            return;
        }

        const threads = await Thread.find({ topic: topic._id })
            .populate({ path: 'createdBy', select: 'pseudo avatar ' })

        if (!threads) {
            console.warn('❌ Discussions non trouvées');
            res.json({ result: false, error: 'discussion non trouvé' });
            return;
        }
        console.log('➡️ threads', threads)

        const comments = await Comment.find({ thread: { $in: threads.map(thread => thread._id) } })
            .populate({ path: 'createdBy', select: 'pseudo avatar ' });

        console.log("➡️ comments :", comments);

        // if (comments.length === 0) {
        //     console.warn('❌ Commentaires non trouvées');
        //     res.json({ result: false, error: 'commentaires non trouvées' });
        //     return;
        // }

        // Regrouper les commentaires par threadId
        interface CommentData {
            id: string;
            text?: string | null;
            createdBy?: any;
            creationDate?: Date | null;
        }

        const commentsByThread: Record<string, CommentData[]> = {};

        //fait le tour de [comments]
        comments.forEach(comment => {
            if (comment.thread !== null && comment.thread !== undefined) {
                const threadId = comment.thread.toString();
                if (!commentsByThread[threadId]) {
                    commentsByThread[threadId] = []
                }

                commentsByThread[threadId].push({
                    id: comment._id.toString(),
                    text: comment.text,
                    createdBy: comment.createdBy,
                    creationDate: comment.creationDate,
                });
            }
        });
        const discussion = {
            id: topic._id,
            title: topic.title,
            description: topic.description,
            createdBy: topic.createdBy,
            isLocked: topic.isLocked,
            creationDate: topic.creationDate,
            topicThread: threads.map(thread => ({
                id: thread._id,
                text: thread.text,
                createdBy: thread.createdBy,
                creationDate: thread.creationDate,
                comments: commentsByThread[thread._id.toString()] || [] //va récupérer les {commentaires} push à partir de chaque thread._id précédement
            })),
        };

        res.json({ result: true, discussion, success: `✅ discussion "${discussion.title}" récupérée` });
    } catch (error) {
        console.error('❌ Erreur serveur lors de /topicContent:', error);
        res.status(500).json({ result: false, error: 'Erreur de serveur' });
    }
});

router.put("/editTopic", async (req, res) => {
    console.log('➡️ [PUT] /editTopic');
    try {
        const { token, title, description, id } = req.body;

        const authResponse = await checkToken({ token });

        if (!authResponse.result || !authResponse.user) {
            res.json({result : false, error : authResponse.error});
            return;
        }

        if (!title || !description) {
            console.warn('❌ Champs vides');
            res.json({ result: false, error: 'veuillez remplir tous les champs' });
            return;
        }

        const topic = await Topic.findOneAndUpdate({ _id: id }, { title, description }, { new: true });

        if (!topic) {
            console.warn('❌ Sujet non trouvé');
            res.json({ result: false, error: 'Sujet non trouvé' });
            return;
        }

        console.log(`✅ Sujet modifié: ${topic.title}`);
        res.json({ result: true, success: 'Sujet mis à jour', topic });

    } catch (error) {
        console.error('❌ Erreur serveur lors de /editTopic:', error);
        res.status(500).json({ result: false, error: 'Erreur de serveur' });
    }
});

router.put("/lockTopic", async (req, res) => {
    console.log('➡️ [PUT] /lockTopic');
    try {
        const { token, id, isLocked } = req.body;

        if (!token) {
            console.warn('❌ Token manquant');
            res.json({ result: false, error: 'veuillez vous connecter' });
            return;
        }

        const lockTopic = await Topic.findOneAndUpdate({ _id: id }, { isLocked: !isLocked }, { new: true });

        if (!lockTopic) {
            console.warn('❌ Sujet non trouvé');
            res.json({ result: false, error: 'Sujet non trouvé' });
            return;
        }

        console.log(`✅ Sujet ${lockTopic.title} vérouillé: ${lockTopic.isLocked}`);
        res.json({ result: true, success: "Sujet vérouillé", isLocked: lockTopic.isLocked });
    } catch (error) {
        console.error('❌ Erreur serveur lors de /lockTopic:', error);
        res.status(500).json({ result: false, error: 'Erreur de serveur' });
    }
});

export default router;
