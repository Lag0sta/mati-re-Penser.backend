import { Router } from 'express';
import Book from '../models/books';
import { checkAdmin } from '../utils/authActions';


const router = Router();

router.post("/newBookInfo", async (req, res) => {
    try {
        const { pseudo,token, titre, text } = req.body;

        const authResponse = await checkAdmin({ token, pseudo });

        if (!authResponse.result || !authResponse.user) {
            res.json({ result: false, error: authResponse.error });
            return;
        }

        const newBookInfo = new Book({
            titre: titre,
            text: text,
        });

        await newBookInfo.save();

        res.json({
            result: true,
            success: '✅ Informations ajoutées',
            book: newBookInfo.titre,
            creationDate: new Date(),
        });
    } catch (error) {
        console.error('🔥 Erreur serveur /newBook:', error);
        res.status(500).json({ result: false, error: error });
    }
});

export default router;
