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
        const { token, title, description } = req.body;
        //vérification du token
        if (!token) {
            res.json({ result: false, error: 'veuillez vous connecter' })
        }

        //récupération iD de l'utilisateur
        const user = await User.findOne({ accessToken: token })

        if (!user) {
            res.json({ result: false, error: "l'utilisateur n'a pas été trouvé" })
            return;
        }

        //vérification des champs vide
        if (!title || !description) {
            res.json({ result: false, error: 'Veuillez remplir tous les champs' });
            return;
        }

        //recherche de l'élément pour vérifier si il existe
        const topic = await Topic.findOne({ title: title })

        if (topic) {
            res.json({ result: false, error: 'Sujet déja existant' });
            return;
        }

        //création du nouveau topic
        const newTopic = new Topic({
            title: title,
            description: description,
            isLocked: false,
            createdBy: user?._id,
            creationDate: new Date()
        })

        await newTopic.save()
        res.json({ result: true, newTopic })

    } catch (error) {
        res.status(500).json({ result: false, message: 'Erreur de Serveur' });
    }
})

//route pour afficher les topics et le nombre de threads
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
        res.status(500).json({ result: false, message: 'Erreur de serveur' });
    }
});

//route pour récupérer les threads d'un topic avec sa description
router.post('/topicContent', async (req, res) => {
    try {
        const { title } = req.body;
        //recherche des informations concernant le topic
        const topic = await Topic.findOne({ title: title })
            .populate({
                path: 'createdBy',
                select: 'pseudo avatar'
            });;

        if (!topic) {
            res.json({ result: false, error: 'Sujet non trouvé' });
            return;
        }

        //recuperation des threads du topic
        //res.json(threads) == [{},{},{}] => .map pour transformer
        const threads = await Thread.find({ topic: topic._id })
            .populate({
                path: 'createdBy',
                select: 'pseudo avatar'
            });

        if (!threads) {
            res.json({ result: false, error: 'discussion non trouvé' });
            return;
        }

        const discussion = {
            id: topic._id,
            title: topic.title,
            description: topic.description,
            createdBy: topic.createdBy,
            isLocked: topic.isLocked,
            creationDate: topic.creationDate,
            topicThread: threads.map((thread) => ({
                id: thread._id,
                text: thread.text,
                createdBy: thread.createdBy,
                creationDate: thread.creationDate,
            })),
        }

        res.json({ result: true, discussion })
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: false, message: 'Erreur de serveur' });
    }
});

router.put("/editTopic", async (req, res) => {
    try {
        const { token, title, description, id } = req.body;
        //vérification du token
        if (!token) {
            res.json({ result: false, error: 'veuillez vous connecter' })
        }

        if (!title || !description) {
            res.json({ result: false, error: 'veuillez remplir tous les champs' });
            return;
        }

        const topic = await Topic.findOneAndUpdate({ _id: id },
            { title: title, description: description },
            { new: true });

        if (!topic) {
            res.json({ result: false, error: 'Sujet non trouvé' });
            return;
        }

        res.json({ result: true, success: 'Sujet mis à jour', topic });

    } catch (error) {
        console.error(error);
        res.status(500).json({ result: false, message: 'Erreur de serveur' });
    }
})

router.put("/lockTopic", async (req, res) => {
    try{
        const { token, id, isLocked } = req.body;
        //vérification du token
        if (!token) {
            res.json({ result: false, error: 'veuillez vous connecter' })
        }

        const lockTopic = await Topic.findOneAndUpdate({ _id: id },
            { isLocked: !isLocked },
            { new: true, });

        if (!lockTopic) {
            res.json({ result: false, error: 'Sujet non trouvé' });
            return;
        }

        res.json({ result: true, success : "Sujet vérouillé", isLocked: lockTopic.isLocked });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: false, message: 'Erreur de serveur' });
    }
})

export default router;