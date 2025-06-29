import express from 'express';
import {
    createAll,
    deleteAll,
    getAll,
    putALL,
    getnotebyid,
} from '../controllers/controller.js';

const router = express.Router();

router.get('/', getAll);
router.get('/:id',getnotebyid);
router.post('/', createAll);
router.put('/:id', putALL);
router.delete('/:id', deleteAll);

export default router;
