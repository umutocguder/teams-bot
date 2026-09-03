import { CardFactory, Attachment } from 'botbuilder';

export function createWelcomeCard(botName: string = 'Teams Bot'): Attachment {
    const card = {
        type: 'AdaptiveCard',
        body: [
            {
                type: 'TextBlock',
                size: 'Large',
                weight: 'Bolder',
                text: `👋 Merhaba! Ben ${botName}`
            },
            {
                type: 'TextBlock',
                text: 'Microsoft Teams ortamında görevlerinizi otomatikleştirmek ve yardımcı olmak için hazırım.',
                wrap: true
            },
            {
                type: 'FactSet',
                facts: [
                    { title: 'Durum:', value: '🟢 Aktif / Çalışıyor' },
                    { title: 'Geliştirici:', value: 'Umut Öçgüder' },
                    { title: 'Ortam:', value: 'Node.js + Bot Framework' }
                ]
            }
        ],
        actions: [
            {
                type: 'Action.Submit',
                title: '📌 Komutları Listele',
                data: { command: 'help' }
            },
            {
                type: 'Action.OpenUrl',
                title: '🌐 GitHub',
                url: 'https://github.com/umutocguder'
            }
        ],
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        version: '1.4'
    };

    return CardFactory.adaptiveCard(card);
}
