/**
 * Created by 11Hopem
 * Copyright (c) 2026 11hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TelemetryLogger } from '../src/telemetry/logger.ts';
import { FIREBASE_ECOSYSTEM_CONFIG } from '../src/telemetry/firebaseConfig.ts';

test('Telemetry: Firebase ecosystem config verification', () => {
  assert.equal(FIREBASE_ECOSYSTEM_CONFIG.projectId, 'hopem-software-cloud');
  assert.equal(FIREBASE_ECOSYSTEM_CONFIG.account, 'umutocgdr@gmail.com');
  assert.ok(FIREBASE_ECOSYSTEM_CONFIG.errorReportingUrl.includes('hopem-software-cloud'));
});

test('Telemetry: Logger records info and error events with local custody file', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'teams-bot-test-'));
  const logger = new TelemetryLogger({ appName: 'teams-test', logDir: tmpDir });

  const entry = logger.info('Teams bot ping dispatched', { jitter: 12 });
  assert.ok(entry);
  assert.equal(entry.level, 'INFO');
  assert.equal(entry.appName, 'teams-test');
  assert.equal(entry.context.jitter, 12);

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
