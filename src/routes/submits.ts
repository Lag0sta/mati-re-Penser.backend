import { Router } from 'express';
import Topic from '../models/topics';
import Thread from '../models/threads';
import User from '../models/users';

const router = Router();

router.get('/', (req, res) => {
    Topic.find().then((data) => {
        res.json(data)
    })
})

router.post('/newTopic', async (req, res) => {
    try {
        //vérification du token
        if (!req.body.token) {
            res.json({ result: false, error: 'please Login' })
        }

        //récupération iD de l'utilisateur
        const user = await User.findOne({ accessToken: req.body.token })

        if (!user) {
            console.log(req.body.token)
            res.json({ result: false, error: 'could not find the user' })
        }

        //vérification des champs vide
        if (!req.body.title || !req.body.description) {
            res.json({ result: false, error: 'fill the fields' });
            return;
        }

        //recherche de l'élément pour vérifier si il existe
        const topic = await Topic.findOne({ title: req.body.title })

        if (topic) {
            res.json({ result: false, error: 'Topic already exist' });
            return;
        }

        //création du nouveau topic
        const newTopic = new Topic({
            title: req.body.title,
            description: req.body.description,
            createdBy: user?._id
        })

        await newTopic.save()
        res.json({ result: true, message: 'Topic created' })

    } catch (error) {
        res.status(500).json({ result: false, message: 'Server error' });
    }
})

router.post('/thread', async (req, res) => {
    try {
        if (!req.body.token) {
            res.json({ result: false, error: 'please Login' })
        }

        //récupération iD de l'utilisateur
        const user = await User.findOne({ accessToken: req.body.token })

        if (!user) {
            res.json({ result: false, error: 'please Login' })
        }

        //vérification des champs vide
        if (!req.body.text) {
            res.json({ result: false, error: 'fill the fields' });
            return;
        }

        //vérification du topic
        const topic = await Topic.findOne({ title: req.body.title })

        if (!topic) {
            res.json({ result: false, error: 'Topic not found' });
            return;
        }

        //post du commentaire
        const newThread = new Thread({
            topic: topic?._id,
            text: req.body.text,
            createdBy: user?._id,
            creationDate: new Date()
        })

        await newThread.save()
        res.json({ result: true, message: 'Thread created' })

    } catch (error) {
        res.status(500).json({ result: false, message: 'Server error' });
    }
})

router.get('/topicsWithThreadCounts', async (req, res) => {
    try {
        const topics = await Topic.find();

        // Récupère les counts groupés par topic
        const threadCounts = await Thread.aggregate([
            {
                $group: {
                    _id: '$topic', // ✅ Corrigé ici
                    count: { $sum: 1 }
                }
            }
        ]);

        // Récupère les dates de dernière modification groupées par topic
        const lastModifiedDates = await Thread.aggregate([
            {
                $group: {
                    _id: "$topic",               // grouper par topic ID
                    lastModified: { $max: "$creationDate" } // prendre la date max de création
                }
            }
        ]);

        // Map pour lookup rapide
        const lastModifiedMap: Record<string, Date> = {};
        lastModifiedDates.forEach(item => {
            lastModifiedMap[item._id.toString()] = item.lastModified;
        });

        // Crée un map rapide { topicId: count }
        const countMap: Record<string, number> = {};
        threadCounts.forEach(tc => {
            countMap[tc._id.toString()] = tc.count;
        });

        // Enrichit chaque topic avec threadCount
        const enrichedTopics = topics.map(topic => ({
            ...topic.toObject(),
            threadCount: countMap[topic._id.toString()] || 0,
            lastModified: lastModifiedMap[topic._id.toString()]
        }));

        res.json(enrichedTopics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: false, message: 'Server error' });
    }
});


export default router;