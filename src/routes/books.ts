import { Router } from 'express';
import Book from '../models/books';
import { checkAdmin } from '../utils/authActions';


const router = Router();

//route pour recuperer tous les topics avec le nombre de commentaires
router.get('/publications', async (req, res) => {
    console.log('➡️ [GET] /publications');
    try {
        const topics = await Book.find();

        console.log("✅", topics, "commentaires retournés");
        res.json({ topics, success: ` publications trouvés` });
    } catch (error) {
        console.error('❌ Erreur serveur:', error);
        res.status(500).json({ result: false, error: 'Erreur de serveur' });
    }
});

//route pour enregistrer le nouveau sujet
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
        console.error('🔥 Erreur serveur /newBook:', error);
        res.status(500).json({ result: false, error: error });
    }
});

export default router;
