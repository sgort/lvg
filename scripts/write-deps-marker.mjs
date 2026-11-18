// Snapshots package-lock.json into node_modules right after a successful install,
// so scripts/check-deps.sh can later compare the lockfile on disk with what was
// actually installed. Content is compared rather than file times, because git
// rewrites tracked files even when their content is unchanged.
import { copyFileSync } from 'node:fs';

copyFileSync('package-lock.json', 'node_modules/.package-lock-installed.json');
