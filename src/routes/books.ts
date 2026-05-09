import { Router } from 'express';
import Book from '../models/books';
import User from '../models/users';
import { checkAdmin } from '../utils/authActions';
import { validate } from "../middlewares/validate";
import { newBookInfoSchema, editBookTextSchema, editBookImgSchema, archiveStatusSchema, editBookMarketUrlSchema } from "../schemas/books.schema";

const router = Router();

//route pour recuperer tous les topics avec le nombre de commentaires
router.get('/publications', async (req, res) => {
    try {
        const books = await Book.find();

        res.json({ books, success: ` publications trouvés` });
    } catch (error) {
        res.status(500).json({ result: false, error: 'Erreur de serveur' });
    }
});

//route pour enregistrer le nouveau sujet
router.post("/newBookInfo", validate(newBookInfoSchema), async (req, res) => {
    try {
        const { pseudo, token, titre, text } = req.body;

        const authResponse = await checkAdmin({ token, pseudo });

        if (!authResponse.result || !authResponse.user) {
            res.json({ result: false, error: authResponse.error });
            return;
        }

        const newBookInfo = new Book({
            titre: titre,
            text: text,
            creationDate: Date.now(),
        });

        await newBookInfo.save();

        res.json({
            result: true,
            success: '✅ Informations ajoutées',
            book: newBookInfo.titre,
            creationDate: newBookInfo.creationDate,
        });
    } catch (error) {
        res.status(500).json({ result: false, error: error });
    }
});

router.put("/editBookText", validate(editBookTextSchema), async (req, res) => {
    try {
        const {text, titre, id, token, pseudo} = req.body

        const authResponse = await checkAdmin({ token, pseudo });

        if (!authResponse.result || !authResponse.user) {
            res.json({ result: false, error: authResponse.error });
            return;
        }

        const editedBook = await Book.findOneAndUpdate({ _id: id }, { text, titre }, { new: true });

         if (!editedBook) {
            res.json({ result: false, message: '❌ Publication non trouvé' });
            return;
        }

        res.json({ result: true, message: '✅ Publication mis à jour ', editedBook });

    } catch (error) {
        res.status(500).json({ result: false, error: error });
    }
})

router.put("/editBookImg", validate(editBookImgSchema), async (req, res) => {
    try {
        const {img, id, token, pseudo} = req.body

        const authResponse = await checkAdmin({ token, pseudo });

        if (!authResponse.result || !authResponse.user) {
            res.json({ result: false, error: authResponse.error });
            return;
        }

        const editedBook = await Book.findOneAndUpdate({ _id: id }, { img }, { new: true });

         if (!editedBook) {
            res.json({ result: false, message: '❌ Publication non trouvé' });
            return;
        }

        res.json({ result: true, message: '✅ Publication mis à jour ', editedBook });
        
    } catch (error) {
        res.status(500).json({ result: false, error: error });
    }
})


router.put("/editBookMarketURL", validate(editBookMarketUrlSchema), async (req, res) => {
    try{
        const { id, token, pseudo, url} = req.body

        const authResponse = await checkAdmin({ token, pseudo });

        if (!authResponse.result || !authResponse.user) {
            res.json({ result: false, error: authResponse.error });
            return;
        }

        const isAdmin = await User.findOne({ pseudo });

        if(!isAdmin?.isAdmin) {
            res.json({ result: false, message: '❌ Utilisateur non autorisé' });
            return;
        }

        const editedBook = await Book.findOneAndUpdate({ _id: id }, { lien: url }, { new: true });

        res.json({ result: true, message: '✅ Publication mis à jour ', editedBook });

    }catch(error){
        res.status(500).json({ result: false, error: error });
    }
})


router.put("/archiveStatus", validate(archiveStatusSchema), async (req, res) => {
    try {
        const {isArchived, id, token, pseudo} = req.body

        const authResponse = await checkAdmin({ token, pseudo });

        if (!authResponse.result || !authResponse.user) {
            res.json({ result: false, error: authResponse.error });
            return;
        }

        const editedBook = await Book.findOneAndUpdate({ _id: id }, { isArchived }, { new: true });

         if (!editedBook) {
            res.json({ result: false, message: '❌ Publication non trouvé' });
            return;
        }

        res.json({ result: true, message: '✅ Publication mis à jour ', editedBook });
        
    } catch (error) {
        res.status(500).json({ result: false, error: error });
    }
})

export default router;
