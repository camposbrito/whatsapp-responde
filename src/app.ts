import express from 'express';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { createMessageRouter } from './routes/message.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para entender JSON no corpo das requisições
app.use(express.json());

console.log('Iniciando o cliente do WhatsApp...');

// Inicializa o cliente do WhatsApp com a estratégia de autenticação local
const client = new Client({
  authStrategy: new LocalAuth(), // Isso salva a sessão em .wwebjs_auth/
  puppeteer: {
    headless: true, // Roda o navegador em segundo plano
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Argumentos necessários para rodar em alguns ambientes (ex: Docker)
  },
});

// Evento: Geração do QR Code
client.on('qr', (qr) => {
  console.log('QR Code recebido! Escaneie com seu celular:');
  qrcode.generate(qr, { small: true });
});

// Evento: Autenticação bem-sucedida
client.on('authenticated', () => {
    console.log('Autenticação realizada com sucesso!');
});

// Evento: Cliente pronto para uso
client.on('ready', () => {
  console.log('✅ Cliente do WhatsApp está pronto e conectado!');

  // Injetamos o cliente pronto nas nossas rotas
  const messageRouter = createMessageRouter(client);
  app.use('/api', messageRouter);

  // Inicia o servidor Express APENAS quando o cliente estiver pronto
  app.listen(PORT, () => {
    console.log(`🚀 Servidor da API rodando na porta ${PORT}`);
    console.log(`Endpoint de envio: POST http://localhost:${PORT}/api/send-message`);
  });
});

// Evento: Falha na autenticação
client.on('auth_failure', msg => {
    console.error('❌ Falha na autenticação!', msg);
    process.exit(1); // Encerra o processo se a autenticação falhar
});

// Inicia o processo de conexão do cliente
client.initialize();