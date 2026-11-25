// Packaging entry for Sizzle & Serve (Node 22+, standard library only).
// Copies game/ and screenshots/ into the output folder and writes dossier.json beside them.
// Locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function refresh(name: string, required: boolean): void {
  const from = join(root, name);
  const to = join(outDir, name);
  rmSync(to, { recursive: true, force: true });
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
  else if (required) throw new Error(`missing ${name}/ next to main.ts`);
}

mkdirSync(outDir, { recursive: true });
refresh('game', true);
refresh('screenshots', false);

const limits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, limits));
console.log(`wrote ${join(outDir, 'dossier.json')}`);
