import {
    TeamsActivityHandler,
    TurnContext,
    MessageFactory,
    ChannelAccount
} from 'botbuilder';
import { createWelcomeCard } from './cards/welcomeCard';

export class TeamsBot extends TeamsActivityHandler {
    constructor() {
        super();

        // 1. Yeni üye katıldığında veya bot ilk eklendiğinde karşılama kartı gönder
        this.onMembersAdded(async (context: TurnContext, next: () => Promise<void>) => {
            const membersAdded = context.activity.membersAdded || [];
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    const welcomeCard = createWelcomeCard('Teams Bot');
                    await context.sendActivity(MessageFactory.attachment(welcomeCard));
                }
            }
            await next();
        });

        // 2. Mesaj alındığında işleme
        this.onMessage(async (context: TurnContext, next: () => Promise<void>) => {
            // Mesajın içeriğindeki mention'ları temizle
            TurnContext.removeRecipientMention(context.activity);
            const text = (context.activity.text || '').trim();
            const lowerText = text.toLowerCase();

            // Kart aksiyonlarından gelen verileri kontrol et
            if (context.activity.value) {
                const valueData = context.activity.value;
                if (valueData.command === 'help') {
                    await this.sendHelpResponse(context);
                    await next();
                    return;
                }
            }

            // Komut bazlı yönlendirme
            switch (lowerText) {
                case 'ping':
                    await context.sendActivity('🏓 Pong! Bot aktif ve Teams ile iletişimde.');
                    break;

                case 'help':
                case 'yardım':
                case '?':
                    await this.sendHelpResponse(context);
                    break;

                case 'kart':
                case 'card':
                case 'info':
                    const card = createWelcomeCard('Teams Asistanı');
                    await context.sendActivity(MessageFactory.attachment(card));
                    break;

                case 'status':
                case 'durum':
                    const uptime = Math.floor(process.uptime());
                    await context.sendActivity(`⚙️ **Sistem Durumu:**\n- Çalışma Süresi: ${uptime} saniye\n- Node.js: ${process.version}\n- Platform: ${process.platform}`);
                    break;

                case '':
                    // Boş mesaj veya sadece bot mention
                    await context.sendActivity('👋 Merhaba! Bana bir komut yazabilirsiniz. Seçenekleri görmek için `yardım` yazın.');
                    break;

                default:
                    await context.sendActivity(
                        `💬 **Gelen Mesaj:** "${text}"\n\nKomutları listelemek için \`yardım\` veya \`help\` yazabilirsiniz.`
                    );
                    break;
            }

            await next();
        });
    }

    private async sendHelpResponse(context: TurnContext): Promise<void> {
        const helpMessage = 
`📋 **Kullanabileceğiniz Komutlar:**
- \`ping\` : Botun canlılık ve gecikme kontrolü.
- \`kart\` / \`card\` : Tanıtım Adaptive Card kartını görüntüler.
- \`durum\` / \`status\` : Botun çalışma ve sistem bilgilerini verir.
- \`yardım\` / \`help\` : Bu yardım menüsünü listeler.`;

        await context.sendActivity(helpMessage);
    }
}
