/**
 * Created by 11hopem (11 Hopem Software Ltd. Şti.)
 * Contact: umutocgdr@gmail.com
 *
 * Copyright (c) 2026 11hopem. All rights reserved.
 * Licensed under proprietary software license terms.
 * Any unauthorized reproduction, transfer, or distribution is strictly prohibited.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { config } from './config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const BACKUP_DIR = path.join(DATA_DIR, 'backups');
export const LATEST_BACKUP_PATH = path.join(BACKUP_DIR, 'teams_bot_latest_backup.json');
export const CHECKSUM_LOG_PATH = path.join(BACKUP_DIR, 'teams_bot_checksums.json');

export interface TeamsBotBackupPayload {
  version: string;
  botName: string;
  timestamp: string;
  config: {
    port: number;
    hasAppId: boolean;
    hasTenantId: boolean;
    appType: string;
  };
  features: string[];
}

export function createTeamsBotBackup() {
  const payload: TeamsBotBackupPayload = {
    version: '1.0.0',
    botName: 'Microsoft Teams Activity & Status Bot',
    timestamp: new Date().toISOString(),
    config: {
      port: config.port,
      hasAppId: !!config.MicrosoftAppId,
      hasTenantId: !!config.MicrosoftAppTenantId,
      appType: config.MicrosoftAppType
    },
    features: [
      'Activity Keep-Alive',
      'Restify CloudAdapter Messaging',
      'Telemetry Firebase & Local JSONL',
      'Presentation Mode Simulation'
    ]
  };

  const rawJson = JSON.stringify(payload, null, 2);

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const sha256 = crypto.createHash('sha256').update(rawJson).digest('hex');
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const timestampedPath = path.join(BACKUP_DIR, `teams_bot_backup_${dateStr}.json`);

  fs.writeFileSync(timestampedPath, rawJson, 'utf-8');
  fs.writeFileSync(LATEST_BACKUP_PATH, rawJson, 'utf-8');

  const metadata = {
    timestamp: new Date().toISOString(),
    botName: payload.botName,
    sha256,
    fileSize: Buffer.byteLength(rawJson, 'utf-8'),
    backupFile: path.basename(timestampedPath),
    latestBackupFile: path.basename(LATEST_BACKUP_PATH)
  };

  let checksumLog: Array<typeof metadata> = [];
  if (fs.existsSync(CHECKSUM_LOG_PATH)) {
    try {
      checksumLog = JSON.parse(fs.readFileSync(CHECKSUM_LOG_PATH, 'utf-8'));
      if (!Array.isArray(checksumLog)) checksumLog = [];
    } catch {
      checksumLog = [];
    }
  }

  checksumLog.unshift(metadata);
  if (checksumLog.length > 30) checksumLog = checksumLog.slice(0, 30);
  fs.writeFileSync(CHECKSUM_LOG_PATH, JSON.stringify(checksumLog, null, 2), 'utf-8');

  return metadata;
}

export function verifyTeamsBotBackupIntegrity(): boolean {
  if (!fs.existsSync(LATEST_BACKUP_PATH)) return false;

  try {
    const raw = fs.readFileSync(LATEST_BACKUP_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return !!(
      parsed.botName &&
      parsed.config &&
      typeof parsed.config.port === 'number' &&
      Array.isArray(parsed.features) &&
      parsed.features.length > 0
    );
  } catch {
    return false;
  }
}

export function restoreTeamsBotFromBackup(): TeamsBotBackupPayload {
  if (!fs.existsSync(LATEST_BACKUP_PATH)) {
    throw new Error('Latest backup file does not exist');
  }

  const raw = fs.readFileSync(LATEST_BACKUP_PATH, 'utf-8');
  return JSON.parse(raw);
}
