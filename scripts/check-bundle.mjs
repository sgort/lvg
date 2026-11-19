#!/usr/bin/env node
// check-bundle.mjs: fails when dist/ contains details that must stay on the server.
//
// The LVG API is the only part that talks to Operaton; its address and login never belong
// in what the browser downloads. Run after `npm run build`.
//
// Phased, as agreed on 19 November 2026 (plan, Task 9): the old page in src/ still calls the
// public Operaton itself until Task 19 removes it, so `operaton.open-regels.nl` is added to
// FORBIDDEN in Task 19. Until then the check covers the local engine and its login.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const FORBIDDEN = ['localhost:8081', 'demo:demo'];

const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });

let list;
try {
  list = files(DIST);
} catch {
  console.error(`check-bundle: ${DIST}/ not found. Run npm run build first.`);
  process.exit(1);
}

const hits = list.flatMap((file) => {
  const text = readFileSync(file, 'latin1');
  return FORBIDDEN.filter((value) => text.includes(value)).map((value) => ({ file, value }));
});

if (hits.length > 0) {
  for (const { file, value } of hits)
    console.error(`check-bundle: ${relative('.', file)} contains ${value}`);
  process.exit(1);
}

console.log(
  `check-bundle: ${list.length} files in ${DIST}/, none contains ${FORBIDDEN.join(' or ')}.`
);
