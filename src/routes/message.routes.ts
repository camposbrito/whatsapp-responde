import { Router } from 'express';
import { body } from 'express-validator';
import { Client } from 'whatsapp-web.js';
// Importe a nova função do controller e o multer
import { sendMessage, sendMedia } from '../controllers/message.controller';
import multer from 'multer';

// Configuração do Multer para usar a memória para armazenar o arquivo temporariamente
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const createMessageRouter = (client: Client) => {
  const router = Router();

  // Rota para enviar mensagens de texto (sem alterações)
  router.post(
    '/send-message',
    [
      // Validação do número: precisa ser um número de telefone válido no Brasil
      body('number')
        .isMobilePhone('pt-BR')
        .withMessage('Por favor, forneça um número de telefone válido no formato brasileiro (com DDD).'),
      // Validação da mensagem: não pode estar vazia e deve ter no máximo 1000 caracteres
      body('message')
        .notEmpty()
        .withMessage('A mensagem não pode estar vazia.')
        .isLength({ max: 1000 })
        .withMessage('A mensagem deve ter no máximo 1000 caracteres.'),
    ],
    sendMessage(client) // Passamos o cliente para o controller
  );

  // NOVA ROTA PARA ENVIAR MÍDIA (IMAGENS, DOCUMENTOS, ETC)
  router.post(
    '/send-media',
    // 1. O middleware do multer processa um único arquivo do campo "media"
    upload.single('media'),
    // 2. Validações do corpo da requisição
    [
      body('number').isMobilePhone('pt-BR').withMessage('Número de telefone inválido.'),
      // A legenda (caption) é opcional, então não precisa de validação "notEmpty"
      body('caption').isString().optional(),
    ],
    // 3. Chama o controller de envio de mídia
    sendMedia(client)
  );

  return router;
};