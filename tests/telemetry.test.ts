/**
 * Created by 11Hopem
 * Copyright (c) 2026 11Hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TelemetryLogger, scrubSensitiveData, toFirestoreFields } from '../src/telemetry/logger.ts';
import { FIREBASE_ECOSYSTEM_CONFIG } from '../src/telemetry/firebaseConfig.ts';

test('Telemetry: Firebase ecosystem config verification', () => {
  assert.equal(FIREBASE_ECOSYSTEM_CONFIG.projectId, 'hopem-software-cloud');
  assert.equal(FIREBASE_ECOSYSTEM_CONFIG.account, 'umutocgdr@gmail.com');
  assert.ok(FIREBASE_ECOSYSTEM_CONFIG.firestoreBaseUrl.includes('hopem-software-cloud'));
  assert.ok(FIREBASE_ECOSYSTEM_CONFIG.errorReportingUrl.includes('hopem-software-cloud'));
});

test('Telemetry: Logger records info and error events with local custody file', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'teams-bot-test-'));
  const logger = new TelemetryLogger({ appName: 'teams-test', logDir: tmpDir });

  const entry = logger.info('Teams bot ping dispatched', { jitter: 12 });
  assert.ok(entry);
  assert.equal(entry.level, 'INFO');
  assert.equal(entry.appName, 'teams-test');
  assert.equal((entry.context as any).jitter, 12);
  assert.equal(entry.targetCollection, 'app_logs');

  const errEntry = logger.error('Teams webhook failure', { status: 502 });
  assert.ok(errEntry);
  assert.equal(errEntry.level, 'ERROR');

  const recents = logger.getRecentLogs(10);
  assert.equal(recents.length, 2);

  if (logger.logFile && fs.existsSync(logger.logFile)) {
    const content = fs.readFileSync(logger.logFile, 'utf-8');
    assert.ok(content.includes('Teams bot ping dispatched'));
  }

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('Telemetry: Zero-crash guarantee on invalid data', () => {
  const logger = new TelemetryLogger({ appName: 'teams-test' });
  const entry = logger.log('', null as any);
  assert.ok(entry);
  assert.equal(entry.level, 'INFO');

  const errEntry = logger.error(new Error('Process exit simulation'));
  assert.ok(errEntry);
  assert.equal(errEntry.message, 'Process exit simulation');
});

test('Telemetry: scrubSensitiveData redacts sensitive fields, TCKN, credit card, tokens', () => {
  const dirty = {
    password: 'SuperSecretPassword',
    token: 'Bearer super-secret-jwt-token',
    user: {
      tckn: '12345678901',
      credit_card: '4543-1234-5678-9012'
    },
    message: 'User with TCKN 12345678901 requested help with card 4543-1234-5678-9012 and Bearer eyJhbGciOi'
  };

  const clean = scrubSensitiveData(dirty) as any;
  assert.equal(clean.password, '***REDACTED***');
  assert.equal(clean.token, '***REDACTED***');
  assert.equal(clean.user.tckn, '***REDACTED***');
  assert.equal(clean.user.credit_card, '***REDACTED***');
  assert.ok(!clean.message.includes('12345678901'));
  assert.ok(!clean.message.includes('4543-1234-5678-9012'));
  assert.ok(!clean.message.includes('eyJhbGciOi'));
});

test('Telemetry: toFirestoreFields creates proper structure', () => {
  const res = toFirestoreFields({
    appName: 'teams-bot',
    count: 10,
    ratio: 4.5,
    active: true,
    empty: null,
    meta: { env: 'production' }
  });

  assert.deepEqual(res.appName, { stringValue: 'teams-bot' });
  assert.deepEqual(res.count, { integerValue: '10' });
  assert.deepEqual(res.ratio, { doubleValue: 4.5 });
  assert.deepEqual(res.active, { booleanValue: true });
  assert.deepEqual(res.empty, { nullValue: null });
  assert.ok((res.meta as any).stringValue.includes('production'));
});

test('Telemetry: Multi-collection routing functions', () => {
  const logger = new TelemetryLogger({ appName: 'teams-test' });

  const sec = logger.security('Unauthorized command execution attempt', { sender: 'unknown' });
  assert.equal(sec?.targetCollection, 'security_audit_logs');

  const cr = logger.crash('Unhandled Teams socket disconnection', { fatal: true });
  assert.equal(cr?.targetCollection, 'crash_logs');

  const tel = logger.telemetry('Bot presence heartbeat pulse', { status: 'available' });
  assert.equal(tel?.targetCollection, 'telemetry_logs');

  const vis = logger.visitor('User conversation started', { tenantId: 'tenant-1' });
  assert.equal(vis?.targetCollection, 'visitor_logs');

  const perf = logger.performance('teams_api_call', 85);
  assert.equal(perf?.targetCollection, 'telemetry_logs');
});
