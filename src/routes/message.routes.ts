import { Router } from 'express';
import { body } from 'express-validator';
import { Client } from 'whatsapp-web.js';
import { sendMessage } from '../controllers/message.controller';

// Criamos uma função que recebe o cliente do WhatsApp como dependência
export const createMessageRouter = (client: Client) => {
  const router = Router();

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

  return router;
};