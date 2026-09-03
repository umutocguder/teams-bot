import * as dotenv from 'dotenv';
dotenv.config();

export interface BotConfig {
    MicrosoftAppId?: string;
    MicrosoftAppPassword?: string;
    MicrosoftAppType?: string;
    MicrosoftAppTenantId?: string;
    port: number;
}

export const config: BotConfig = {
    MicrosoftAppId: process.env.MicrosoftAppId || '',
    MicrosoftAppPassword: process.env.MicrosoftAppPassword || '',
    MicrosoftAppType: process.env.MicrosoftAppType || 'MultiTenant',
    MicrosoftAppTenantId: process.env.MicrosoftAppTenantId || '',
    port: parseInt(process.env.PORT || '3978', 10)
};
