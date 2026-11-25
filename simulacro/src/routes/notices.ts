import { Router } from 'express';
import * as noticesController from '../controllers/noticesController.js';


export const noticesRouter = Router();

// Listar documentos
noticesRouter.get('/', noticesController.list);

// Crear documento
noticesRouter.post('/', noticesController.create);

// Obtener documento por ID
noticesRouter.get('/:noticeId', noticesController.getById);

// Modificar documento
noticesRouter.patch('/:noticeId', noticesController.update);