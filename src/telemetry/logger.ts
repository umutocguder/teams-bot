/**
 * Created by 11Hopem
 * Copyright (c) 2026 11hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

import fs from 'node:fs';
import path from 'node:path';
import { FIREBASE_ECOSYSTEM_CONFIG } from './firebaseConfig.ts';

export interface LogEntry {
  timestamp: string;
  level: string;
  appName: string;
  appVersion: string;
  projectId: string;
  message: string;
  context: Record<string, unknown>;
}

export class TelemetryLogger {
  public appName: string;
  public appVersion: string;
  public projectId: string;
  public logDir: string;
  public logFile: string | null;
  public inMemoryBuffer: LogEntry[];
  public maxBuffer: number;
  public cloudEndpoint: string;

  constructor(config: {
    appName?: string;
    appVersion?: string;
    projectId?: string;
    logDir?: string;
    cloudEndpoint?: string;
    maxBuffer?: number;
  } = {}) {
    this.appName = config.appName || 'teams-bot';
    this.appVersion = config.appVersion || '1.0.0';
    this.projectId = config.projectId || FIREBASE_ECOSYSTEM_CONFIG.projectId;
    this.inMemoryBuffer = [];
    this.maxBuffer = config.maxBuffer || 100;
    this.cloudEndpoint = config.cloudEndpoint || FIREBASE_ECOSYSTEM_CONFIG.errorReportingUrl;

    const baseDir = config.logDir || path.join(process.cwd(), 'logs');
    this.logDir = baseDir;
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
      this.logFile = path.join(this.logDir, `${this.appName}_telemetry.jsonl`);
    } catch (_) {
      this.logFile = null;
    }
  }

  public log(level: string, message: unknown, context: Record<string, unknown> = {}): LogEntry | null {
    try {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: (level || 'INFO').toUpperCase(),
        appName: this.appName,
        appVersion: this.appVersion,
        projectId: this.projectId,
        message: typeof message === 'string' ? message : ((message as Error)?.message || JSON.stringify(message)),
        context: context || {}
      };

      this.inMemoryBuffer.push(entry);
      if (this.inMemoryBuffer.length > this.maxBuffer) {
        this.inMemoryBuffer.shift();
      }

      if (this.logFile) {
        try {
          fs.appendFileSync(this.logFile, JSON.stringify(entry) + '\n', 'utf-8');
        } catch (_) {}
      }

      if (entry.level === 'ERROR' || entry.level === 'CRASH') {
        this.dispatchToCloud(entry);
      }

      return entry;
    } catch (_) {
      return null;
    }
  }

  public info(msg: unknown, ctx?: Record<string, unknown>) { return this.log('INFO', msg, ctx); }
  public warn(msg: unknown, ctx?: Record<string, unknown>) { return this.log('WARN', msg, ctx); }
  public error(msg: unknown, ctx?: Record<string, unknown>) { return this.log('ERROR', msg, ctx); }
  public crash(msg: unknown, ctx?: Record<string, unknown>) { return this.log('CRASH', msg, ctx); }

  private dispatchToCloud(entry: LogEntry): void {
    if (this.cloudEndpoint && typeof fetch !== 'undefined') {
      try {
        fetch(this.cloudEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventTime: entry.timestamp,
            serviceContext: { service: entry.appName, version: entry.appVersion },
            message: `[${entry.level}] ${entry.message}\nContext: ${JSON.stringify(entry.context)}`
          })
        }).catch(() => {});
      } catch (_) {}
    }
  }

  public getRecentLogs(limit = 50): LogEntry[] {
    return this.inMemoryBuffer.slice(-limit);
  }

  public exportLogsAsJson(): string {
    return JSON.stringify(this.inMemoryBuffer, null, 2);
  }
}

export const logger = new TelemetryLogger({ appName: 'teams-bot' });
