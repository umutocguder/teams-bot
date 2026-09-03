import * as restify from 'restify';
import {
    CloudAdapter,
    ConfigurationBotFrameworkAuthentication,
    TurnContext
} from 'botbuilder';
import { config } from './config';
import { TeamsBot } from './bot';

// 1. Bot Kimlik Doğrulama ve Adaptör Yapılandırması
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication({
    MicrosoftAppId: config.MicrosoftAppId,
    MicrosoftAppPassword: config.MicrosoftAppPassword,
    MicrosoftAppType: config.MicrosoftAppType,
    MicrosoftAppTenantId: config.MicrosoftAppTenantId
});

const adapter = new CloudAdapter(botFrameworkAuthentication);

// Hata yakalama mekanizması (onTurnError)
adapter.onTurnError = async (context: TurnContext, error: Error) => {
    console.error(`[onTurnError] Hata meydana geldi: ${error}`);
    console.error(error);
    await context.sendActivity('❌ Bot çalışırken beklenmeyen bir hata ile karşılaştı.');
};

// 2. Bot Örneği Oluşturma
const bot = new TeamsBot();

// 3. HTTP Sunucusu (Restify) Yapılandırması
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Sağlık kontrolü endpoint'i
server.get('/api/health', (req, res, next) => {
    res.send(200, { status: 'healthy', timestamp: new Date().toISOString() });
    next();
});

// Teams mesaj dinleme endpoint'i
server.post('/api/messages', async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});

// Sunucuyu Başlatma
server.listen(config.port, () => {
    console.log(`\n🚀 Microsoft Teams Bot çalışıyor!`);
    console.log(`📡 Dinlenen Adres: http://localhost:${config.port}`);
    console.log(`🔗 Mesaj Endpoint: http://localhost:${config.port}/api/messages`);
    console.log(`💚 Sağlık Kontrolü: http://localhost:${config.port}/api/health\n`);
});
