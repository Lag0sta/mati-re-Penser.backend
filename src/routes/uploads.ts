import { Router } from 'express';
import User from '../models/users';
const router = Router();
const multer = require('multer');


const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, '/uploads')
  },
  filename: function (req: any, file: any, cb: any) {
    cb(null, file.originalname)
  }
})

const upload = multer({storage});

router.post('/uploads', upload.single('file'), (req, res) => {
    res.json(req.file)
})

export default router;