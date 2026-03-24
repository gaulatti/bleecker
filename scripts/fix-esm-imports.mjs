import { promises as fs } from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');

function hasExtension(specifier) {
  return path.extname(specifier) !== '';
}

function normalizeSpecifier(specifier) {
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
    return specifier;
  }

  if (hasExtension(specifier)) {
    return specifier;
  }

  return `${specifier}.js`;
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return walk(entryPath);
      }

      return entryPath;
    })
  );

  return files.flat();
}

async function main() {
  const files = (await walk(distDir)).filter((file) => file.endsWith('.js'));
  const importRegex = /((?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"])(\.\.?\/[^'"]+)(['"])/g;
  let updatedFiles = 0;

  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    const next = source.replace(importRegex, (match, prefix, specifier, suffix) => {
      const normalized = normalizeSpecifier(specifier);
      return normalized === specifier ? match : `${prefix}${normalized}${suffix}`;
    });

    if (next !== source) {
      await fs.writeFile(file, next);
      updatedFiles += 1;
    }
  }

  console.log(`[fix-esm-imports] Updated ${updatedFiles} files.`);
}

main().catch((error) => {
  console.error('[fix-esm-imports] Failed:', error);
  process.exitCode = 1;
});
