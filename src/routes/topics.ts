import { Router } from 'express';
import Topic from '../models/topics';
import Thread from '../models/threads';

import { validate } from "../middlewares/validate";
import { newTopicSchema, topicContentSchema, editTopicSchema, lockTopicSchema } from '../schemas/topics.schema';
import { checkToken } from '../utils/authActions';

const router = Router();

//route pour récupérer tous les topics
router.get('/', (req, res) => {
    Topic.find().then((data) => {
        res.json(data);
    });
});

//route pour créer un sujet
router.post('/newTopic', validate(newTopicSchema), async (req, res) => {
    console.log('➡️ [POST] /newTopic');
    try {
        const { token, title, description } = req.body;

        const authResponse = await checkToken({ token });

        if (!authResponse.result || !authResponse.user) {
            res.json({result : false, error : authResponse.error});
            return;
        }

        const user = authResponse.user

        const topic = await Topic.findOne({ title: title });

        if (topic) {
            res.json({ result: false, error: '❌ Sujet déja existant' });
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
        res.json({ result: true, newTopic, success: `✅ Nouveau sujet créé: ${title}` });

    } catch (error) {
        res.status(500).json({ result: false, error: 'Erreur de ❌ Erreur serveur lors de la création d’un sujet' });
    }
});

//route pour recuperer tous les topics avec le nombre de commentaires
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

//route pour recuperer le contenu d'un sujet
router.post('/topicContent', async (req, res) => {
    console.log('➡️ [POST] /topicContent');
    try {
        const { title } = req.body;
        const topic = await Topic.findOne({ title: title }).populate({
            path: 'createdBy',
            select: 'pseudo avatar'
        });

        if (!topic) {
            res.json({ result: false, message: '❌ Sujet non trouvé' });
            return;
        }

        const threads = await Thread.find({ topic: topic._id })
            .populate({ path: 'createdBy', select: 'pseudo avatar ' })

        if (!threads) {
            res.json({ result: false, message: '❌ discussion non trouvé' });
            return;
        }

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
                quote: thread.quote,
                createdBy: thread.createdBy,
                creationDate: thread.creationDate,
            })),
        };

        res.json({ result: true, discussion, message: `✅ discussion "${discussion.title}" récupérée` });
    } catch (error) {
        res.status(500).json({ result: false, message: '❌ Erreur serveur lors de /topicContent' });
    }
});

//route pour modifier un sujet
router.put("/editTopic", validate(editTopicSchema), async (req, res) => {
    console.log('➡️ [PUT] /editTopic');
    try {
        const { token, title, description, id } = req.body;

        const authResponse = await checkToken({ token });

        if (!authResponse.result || !authResponse.user) {
            res.json({result : false, error : authResponse.error});
            return;
        }

        const topic = await Topic.findOneAndUpdate({ _id: id }, { title, description }, { new: true });

        if (!topic) {
            res.json({ result: false, error: '❌ Sujet non trouvé' });
            return;
        }

        res.json({ result: true, success: '✅ Sujet modifié: ${topic.title}', topic });

    } catch (error) {
        console.error('❌ Erreur serveur lors de /editTopic:', error);
        res.status(500).json({ result: false, error: 'Erreur de serveur' });
    }
});

//route pour verrouiller ou debloquer un sujet
router.put("/lockTopic", validate(lockTopicSchema), async (req, res) => {
    console.log('➡️ [PUT] /lockTopic');
    try {
        const { token, id, isLocked } = req.body;

        const lockTopic = await Topic.findOneAndUpdate({ _id: id }, { isLocked: !isLocked }, { new: true });

        if (!lockTopic) {
            res.json({ result: false, error: '❌ Sujet non trouvé' });
            return;
        }

        res.json({ result: true, success: `✅ Sujet ${lockTopic.title} vérouillé: ${lockTopic.isLocked}`, isLocked: lockTopic.isLocked });
    } catch (error) {
        console.error('❌ Erreur serveur lors de /lockTopic:', error);
        res.status(500).json({ result: false, error: 'Erreur de serveur' });
    }
});

export default router;
