/**
 * Created by 11Hopem
 * Copyright (c) 2026 11Hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

import fs from 'node:fs';
import path from 'node:path';
import { FIREBASE_ECOSYSTEM_CONFIG } from './firebaseConfig';

export interface LogEntry {
  timestamp: string;
  level: string;
  appName: string;
  appVersion: string;
  projectId: string;
  targetCollection?: string;
  message: string;
  context: Record<string, unknown>;
}

const SENSITIVE_KEY_PATTERNS = [
  /pass(word)?/i,
  /token/i,
  /secret/i,
  /auth(orization)?/i,
  /api[_-]?key/i,
  /card[_-]?number/i,
  /credit[_-]?card/i,
  /cvv/i,
  /pin/i,
  /tckn/i
];

const TCKN_REGEX = /\b[1-9]\d{10}\b/g;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
const BEARER_REGEX = /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi;

export function scrubSensitiveData(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    return value
      .replace(BEARER_REGEX, 'Bearer ***REDACTED***')
      .replace(CREDIT_CARD_REGEX, '***CARD_REDACTED***')
      .replace(TCKN_REGEX, '***TCKN_REDACTED***');
  }

  if (Array.isArray(value)) {
    return value.map((item) => scrubSensitiveData(item));
  }

  if (typeof value === 'object') {
    const scrubbed: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((pat) => pat.test(k));
      if (isSensitiveKey) {
        scrubbed[k] = '***REDACTED***';
      } else {
        scrubbed[k] = scrubSensitiveData(v);
      }
    }
    return scrubbed;
  }

  return value;
}

export function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  if (!obj || typeof obj !== 'object') return fields;

  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined || val === null) {
      fields[key] = { nullValue: null };
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: String(val) };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (typeof val === 'string') {
      fields[key] = { stringValue: val.substring(0, 1000) };
    } else if (typeof val === 'object') {
      try {
        fields[key] = { stringValue: JSON.stringify(val).substring(0, 1000) };
      } catch {
        fields[key] = { stringValue: '[Circular/Unserializable]' };
      }
    }
  }
  return fields;
}

export class TelemetryLogger {
  public appName: string;
  public appVersion: string;
  public projectId: string;
  public logDir: string;
  public logFile: string | null;
  public inMemoryBuffer: LogEntry[];
  public maxBuffer: number;
  public offlineQueue: Array<{ firestoreUrl: string; payload: unknown }>;
  public maxOfflineQueue: number;
  public cloudEndpoint: string;

  constructor(config: {
    appName?: string;
    appVersion?: string;
    projectId?: string;
    logDir?: string;
    cloudEndpoint?: string;
    maxBuffer?: number;
  } = {}) {
    this.appName = config.appName || '11-teams-bot';
    this.appVersion = config.appVersion || '1.0.0';
    this.projectId = config.projectId || FIREBASE_ECOSYSTEM_CONFIG.projectId;
    this.inMemoryBuffer = [];
    this.maxBuffer = config.maxBuffer || 100;
    this.offlineQueue = [];
    this.maxOfflineQueue = 50;
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

  public log(level: string, message: unknown, context: Record<string, unknown> = {}, targetCollection = 'app_logs'): LogEntry | null {
    try {
      const scrubbedContext = (scrubSensitiveData(context || {}) as Record<string, unknown>) || {};
      const rawMessage = typeof message === 'string' ? message : ((message as Error)?.message || JSON.stringify(message) || '');
      const scrubbedMessage = String(scrubSensitiveData(rawMessage) || '');

      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: (level || 'INFO').toUpperCase(),
        appName: this.appName,
        appVersion: this.appVersion,
        projectId: this.projectId,
        targetCollection,
        message: scrubbedMessage,
        context: scrubbedContext
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

      this.dispatchToCloud(entry, targetCollection);

      return entry;
    } catch (_) {
      return null;
    }
  }

  public debug(msg: unknown, ctx?: Record<string, unknown>) { return this.log('DEBUG', msg, ctx, 'app_logs'); }
  public info(msg: unknown, ctx?: Record<string, unknown>) { return this.log('INFO', msg, ctx, 'app_logs'); }
  public warn(msg: unknown, ctx?: Record<string, unknown>) { return this.log('WARN', msg, ctx, 'app_logs'); }
  public error(msg: unknown, ctx?: Record<string, unknown>) { return this.log('ERROR', msg, ctx, 'app_logs'); }
  public crash(msg: unknown, ctx?: Record<string, unknown>) { return this.log('CRASH', msg, ctx, 'crash_logs'); }
  public security(event: unknown, ctx?: Record<string, unknown>) { return this.log('SECURITY', event, ctx, 'security_audit_logs'); }
  public telemetry(event: unknown, ctx?: Record<string, unknown>) { return this.log('TELEMETRY', event, ctx, 'telemetry_logs'); }
  public visitor(event: unknown, ctx?: Record<string, unknown>) { return this.log('VISITOR', event, ctx, 'visitor_logs'); }
  public performance(metric: string, durationMs: number, ctx: Record<string, unknown> = {}) {
    return this.log('PERF', `Metric: ${metric} - ${durationMs}ms`, { metric, durationMs, ...ctx }, 'telemetry_logs');
  }

  private dispatchToCloud(entry: LogEntry, collection = 'app_logs'): void {
    if (typeof fetch === 'undefined' || !FIREBASE_ECOSYSTEM_CONFIG.apiKey) {
      return;
    }

    try {
      const firestoreUrl = `${FIREBASE_ECOSYSTEM_CONFIG.firestoreBaseUrl}/${collection}?key=${FIREBASE_ECOSYSTEM_CONFIG.apiKey}`;
      const payload = {
        fields: toFirestoreFields({
          event: `${collection.toUpperCase()}_${entry.level}`,
          timestamp: entry.timestamp,
          projectId: entry.projectId,
          appId: FIREBASE_ECOSYSTEM_CONFIG.appId,
          appName: entry.appName,
          appVersion: entry.appVersion,
          logLevel: entry.level,
          message: entry.message,
          context: entry.context
        })
      };

      fetch(firestoreUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {
        this.enqueueOffline({ firestoreUrl, payload });
      });
    } catch (_) {
      this.enqueueOffline({
        firestoreUrl: `${FIREBASE_ECOSYSTEM_CONFIG.firestoreBaseUrl}/${collection}?key=${FIREBASE_ECOSYSTEM_CONFIG.apiKey}`,
        payload: { fields: toFirestoreFields(entry as unknown as Record<string, unknown>) }
      });
    }
  }

  private enqueueOffline(item: { firestoreUrl: string; payload: unknown }): void {
    try {
      this.offlineQueue.push(item);
      if (this.offlineQueue.length > this.maxOfflineQueue) {
        this.offlineQueue.shift();
      }
    } catch (_) {}
  }

  public flushOfflineQueue(): void {
    if (typeof fetch === 'undefined' || this.offlineQueue.length === 0) return;
    try {
      const items = [...this.offlineQueue];
      this.offlineQueue = [];
      for (const item of items) {
        fetch(item.firestoreUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        }).catch(() => {
          this.enqueueOffline(item);
        });
      }
    } catch (_) {}
  }

  public getRecentLogs(limit = 50): LogEntry[] {
    return this.inMemoryBuffer.slice(-limit);
  }

  public exportLogsAsJson(): string {
    return JSON.stringify(this.inMemoryBuffer, null, 2);
  }

  public clearLogs(): void {
    this.inMemoryBuffer = [];
    this.offlineQueue = [];
    if (this.logFile && fs.existsSync(this.logFile)) {
      try {
        fs.unlinkSync(this.logFile);
      } catch (_) {}
    }
  }
}

export const logger = new TelemetryLogger({ appName: '11-teams-bot' });
