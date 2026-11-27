// Entrypoint for The Deal Check (black-friday-deal-finder-01)
// Prepares distribution directory and builds byte-accurate dossier.json for make.fun evaluation.
// Runs under Node.js 22 with standard library only.

import { cpSync, existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const sourceRoot = fileURLToPath(new URL('.', import.meta.url));
const targetDestination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

console.log(`[The Deal Check] Packaging entry from ${sourceRoot} into ${targetDestination}...`);

// Ensure output root directory exists
mkdirSync(targetDestination, { recursive: true });

// Copy static application files
const sourceAppPath = join(sourceRoot, 'app');
const targetAppPath = join(targetDestination, 'app');
mkdirSync(targetAppPath, { recursive: true });
cpSync(sourceAppPath, targetAppPath, { recursive: true });
console.log(`[The Deal Check] Transferred app/ directory.`);

// Copy captured screenshots
const sourceShotsPath = join(sourceRoot, 'screenshots');
const targetShotsPath = join(targetDestination, 'screenshots');
mkdirSync(targetShotsPath, { recursive: true });
if (existsSync(sourceShotsPath)) {
  cpSync(sourceShotsPath, targetShotsPath, { recursive: true });
  const shotList = readdirSync(targetShotsPath);
  console.log(`[The Deal Check] Transferred screenshots: ${shotList.join(', ')}`);
} else {
  console.warn(`[The Deal Check] Warning: screenshots/ directory not found in source.`);
}

// Generate the dossier using vendor makefun-frontend library
// Respects platform gate limits: 160 KiB text cap, max 4 screenshots <= 256 KiB, max 993 app files <= 16 MiB
const dossierReport = buildDossier(targetDestination, {
  text_max_bytes: 163840,
  screenshots: {
    max: 4,
    max_bytes: 262144,
  },
  app_max_files: 993,
  app_max_bytes: 16777216,
});

const dossierOutputFile = join(targetDestination, 'dossier.json');
writeFileSync(dossierOutputFile, dossierReport);
console.log(`[The Deal Check] dossier.json written successfully (${Buffer.byteLength(dossierReport)} bytes).`);
