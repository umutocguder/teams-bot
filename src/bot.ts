/**
 * Created by 11Hopem
 * Copyright (c) 2026 11hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

import {
  TeamsActivityHandler,
  TurnContext,
  MessageFactory
} from 'botbuilder';
import { createWelcomeCard } from './cards/welcomeCard';

export class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    // 1. Dispatch welcome card when new member joins or bot is added
    this.onMembersAdded(async (context: TurnContext, next: () => Promise<void>) => {
      const membersAdded = context.activity.membersAdded || [];
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          const welcomeCard = createWelcomeCard('11 Teams Bot');
          await context.sendActivity(MessageFactory.attachment(welcomeCard));
        }
      }
      await next();
    });

    // 2. Process incoming activity and messages
    this.onMessage(async (context: TurnContext, next: () => Promise<void>) => {
      // Strip bot recipient mention from message text
      TurnContext.removeRecipientMention(context.activity);
      const text = (context.activity.text || '').trim();
      const lowerText = text.toLowerCase();

      // Check card action payload
      if (context.activity.value) {
        const valueData = context.activity.value;
        if (valueData.command === 'help') {
          await this.sendHelpResponse(context);
          await next();
          return;
        }
      }

      // Command dispatcher
      switch (lowerText) {
        case 'ping':
          await context.sendActivity('🏓 Pong! Bot is active and communicating with Teams.');
          break;

        case 'help':
        case 'yardım':
        case '?':
          await this.sendHelpResponse(context);
          break;

        case 'kart':
        case 'card':
        case 'info':
          const card = createWelcomeCard('Teams Assistant');
          await context.sendActivity(MessageFactory.attachment(card));
          break;

        case 'status':
        case 'durum':
          const uptime = Math.floor(process.uptime());
          await context.sendActivity(`⚙️ **System Status:**\n- Uptime: ${uptime} seconds\n- Node.js: ${process.version}\n- Platform: ${process.platform}`);
          break;

        case '':
          // Empty message or mention only
          await context.sendActivity('👋 Hello! Please enter a command. Type `help` or `yardım` to see available options.');
          break;

        default:
          await context.sendActivity(
            `💬 **Received message:** "${text}"\n\nType \`help\` or \`yardım\` to view available commands.`
          );
          break;
      }

      await next();
    });
  }

  private async sendHelpResponse(context: TurnContext): Promise<void> {
    const helpMessage = 
`📋 **Available Commands:**
- \`ping\` : Checks bot liveness and latency.
- \`card\` / \`kart\` : Displays the introductory Adaptive Card.
- \`status\` / \`durum\` : Displays runtime statistics and system info.
- \`help\` / \`yardım\` : Shows this command reference menu.`;

    await context.sendActivity(helpMessage);
  }
}
