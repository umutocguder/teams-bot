/**
 * Created by 11Hopem
 * Contact: umutocgdr@gmail.com
 *
 * Copyright (c) 2026 11hopem. All rights reserved.
 * Licensed under 11Hopem Proprietary License.
 */

import { createTeamsBotBackup, verifyTeamsBotBackupIntegrity } from '../src/backupService';

try {
  const metadata = createTeamsBotBackup();
  const isIntact = verifyTeamsBotBackupIntegrity();

  if (!isIntact) {
    console.error('[Backup Error]: Teams Bot backup integrity check failed!');
    process.exit(1);
  }

  console.log(`[Backup Success]: ${metadata.botName} backup generated successfully.`);
  console.log(`  File: ${metadata.latestBackupFile}`);
  console.log(`  SHA-256: ${metadata.sha256}`);
  console.log(`  Size: ${metadata.fileSize} bytes`);
} catch (err) {
  console.error('[Backup Error]:', err);
  process.exit(1);
}
