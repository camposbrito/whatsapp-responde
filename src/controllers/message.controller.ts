import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Client } from 'whatsapp-web.js';

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