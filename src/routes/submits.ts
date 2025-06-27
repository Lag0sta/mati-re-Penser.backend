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
        if(!req.body.token){
            res.json({ result: false, error: 'please Login'})
        }

        //récupération iD de l'utilisateur
        const user = await User.findOne({accessToken: req.body.token})

        if(!user){
            console.log(req.body.token)
            res.json({ result: false, error: 'could not find the user'})
        }

        //vérification des champs vide
        if (!req.body.title || !req.body.description){
            res.json({ result: false, error: 'fill the fields' });
            return;
        }

        //recherche de l'élément pour vérifier si il existe
        const topic = await Topic.findOne({title: req.body.title})

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
        
    }catch (error) {
        res.status(500).json({ result: false, message: 'Server error' });
    }
})

router.post('/thread', async (req, res) => {
    try{
        if(!req.body.token){
            res.json({ result: false, error: 'please Login'})
        }

        //récupération iD de l'utilisateur
        const user = await User.findOne({accessToken: req.body.token})

        if(!user){
            res.json({ result: false, error: 'please Login'})
        }

        //vérification des champs vide
        if (!req.body.text){
            res.json({ result: false, error: 'fill the fields' });
            return;
        }

        //vérification du topic
        const topic = await Topic.findOne({title: req.body.title})

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

    }catch (error) {
        res.status(500).json({ result: false, message: 'Server error' });
    }
})

export default router;