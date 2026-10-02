/**
 * Created by 11hopem (11 Hopem Software Ltd. Şti.)
 * Contact: umutocgdr@gmail.com
 *
 * Copyright (c) 2026 11hopem. All rights reserved.
 * Licensed under 11 Hopem Software Proprietary License.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  createTeamsBotBackup,
  verifyTeamsBotBackupIntegrity,
  restoreTeamsBotFromBackup,
  LATEST_BACKUP_PATH,
  CHECKSUM_LOG_PATH
} from '../src/backupService.ts';

describe('Teams Bot - Autonomous Backup & Integrity System (Rule 17)', () => {
  test('should generate autonomous backup with valid payload and SHA-256', () => {
    const metadata = createTeamsBotBackup();

    assert.ok(metadata.sha256, 'SHA-256 hash must be present');
    assert.strictEqual(metadata.sha256.length, 64, 'SHA-256 hash must be 64 characters hex');
    assert.ok(metadata.fileSize > 0, 'Backup file size must be greater than 0');
    assert.ok(fs.existsSync(LATEST_BACKUP_PATH), 'Latest backup file must exist');
  });

  test('should verify integrity of the generated teams-bot backup', () => {
    createTeamsBotBackup();
    const isIntact = verifyTeamsBotBackupIntegrity();
    assert.strictEqual(isIntact, true, 'Backup integrity check must pass');
  });

  test('should successfully restore and decode bot configurations and features from backup', () => {
    createTeamsBotBackup();
    const data = restoreTeamsBotFromBackup();

    assert.ok(data.botName, 'Restored data must have botName');
    assert.ok(data.config, 'Restored data must have config');
    assert.strictEqual(typeof data.config.port, 'number');
    assert.ok(Array.isArray(data.features), 'features must be an array');
    assert.ok(data.features.length >= 3, 'Must contain at least 3 features');
  });

  test('should maintain checksum log capped at 30 entries', () => {
    createTeamsBotBackup();
    assert.ok(fs.existsSync(CHECKSUM_LOG_PATH), 'Checksum log file must exist');

    const log = JSON.parse(fs.readFileSync(CHECKSUM_LOG_PATH, 'utf-8'));
    assert.ok(Array.isArray(log), 'Checksum log must be an array');
    assert.ok(log.length > 0, 'Checksum log must not be empty');
    assert.ok(log.length <= 30, 'Checksum log must not exceed 30 entries');
    assert.ok(log[0].sha256, 'First log entry must contain SHA-256');
  });
});
