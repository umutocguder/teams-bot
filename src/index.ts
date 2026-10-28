/**
 * Created by 11Hopem
 * Copyright (c) 2026 11hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

import * as restify from 'restify';
import {
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication,
  TurnContext
} from 'botbuilder';
import { config } from './config';
import { TeamsBot } from './bot';

// 1. Bot Framework Authentication and Adapter Configuration
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication({
  MicrosoftAppId: config.MicrosoftAppId,
  MicrosoftAppPassword: config.MicrosoftAppPassword,
  MicrosoftAppType: config.MicrosoftAppType,
  MicrosoftAppTenantId: config.MicrosoftAppTenantId
});

const adapter = new CloudAdapter(botFrameworkAuthentication);

// Error handling pipeline (onTurnError)
adapter.onTurnError = async (context: TurnContext, error: Error) => {
  console.error(`[onTurnError] Exception occurred: ${error}`);
  console.error(error);
  await context.sendActivity('❌ The bot encountered an unexpected error.');
};

// 2. Bot Instance Initialization
const bot = new TeamsBot();

// 3. HTTP Server (Restify) Configuration
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Health check endpoint
server.get('/api/health', (req, res, next) => {
  res.send(200, { status: 'healthy', timestamp: new Date().toISOString() });
  next();
});

// Teams message listener endpoint
server.post('/api/messages', async (req, res) => {
  await adapter.process(req, res, (context) => bot.run(context));
});

// Start Server Listener
server.listen(config.port, () => {
  console.log(`\n🚀 11 Teams Bot is running!`);
  console.log(`📡 Listening address: http://localhost:${config.port}`);
  console.log(`🔗 Message endpoint: http://localhost:${config.port}/api/messages`);
  console.log(`💚 Health check: http://localhost:${config.port}/api/health\n`);
});
