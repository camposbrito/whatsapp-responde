import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { Client, MessageMedia } from 'whatsapp-web.js';

// Função para formatar o número para o padrão da lib (5541999998888@c.us)
const formatPhoneNumber = (phone: string) => {
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Adiciona o sufixo @c.us
  return `${cleaned}@c.us`;
};

// Nosso controller
export const sendMessage = (client: Client) => async (req: Request, res: Response) => {
  // 1. Validação dos dados de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 2. Extração dos dados do corpo da requisição
  const { number, message } = req.body;
  const whatsappNumber = formatPhoneNumber(number);

  try {
    // 3. Verificação se o número está registrado no WhatsApp
    const isRegistered = await client.isRegisteredUser(whatsappNumber);
    if (!isRegistered) {
      return res.status(404).json({
        success: false,
        message: 'O número de telefone informado não está registrado no WhatsApp.',
      });
    }

    // 4. Envio da mensagem
    await client.sendMessage(whatsappNumber, message);

    return res.status(200).json({
      success: true,
      message: `Mensagem enviada com sucesso para ${number}`,
    });
  } catch (error) {
    console.error('Erro ao enviar a mensagem:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocorreu um erro interno ao tentar enviar a mensagem.',
    });
  }
};


// NOVA FUNÇÃO PARA ENVIAR MÍDIA
export const sendMedia = (client: Client) => async (req: Request, res: Response) => {
  // 1. Validação dos dados de entrada (o número)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 2. Verificação se o arquivo foi enviado
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Nenhum arquivo foi enviado. Por favor, anexe um arquivo na chave "media".',
    });
  }

  // 3. Extração dos dados
  const { number, caption } = req.body;
  const whatsappNumber = formatPhoneNumber(number);

  // 4. Criação do objeto MessageMedia a partir do arquivo recebido
  const media = new MessageMedia(
    req.file.mimetype,
    req.file.buffer.toString('base64'),
    req.file.originalname
  );

  try {
    // 5. Verificação se o número está registrado
    const isRegistered = await client.isRegisteredUser(whatsappNumber);
    if (!isRegistered) {
      return res.status(404).json({
        success: false,
        message: 'O número de telefone informado não está registrado no WhatsApp.',
      });
    }

    // 6. Envio da mídia com uma legenda (caption) opcional
    await client.sendMessage(whatsappNumber, media, {
      caption: caption || '', // Usa a legenda do body ou uma string vazia
    });

    return res.status(200).json({
      success: true,
      message: `Mídia enviada com sucesso para ${number}`,
    });
  } catch (error) {
    console.error('Erro ao enviar a mídia:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocorreu um erro interno ao tentar enviar a mídia.',
    });
  }
};

