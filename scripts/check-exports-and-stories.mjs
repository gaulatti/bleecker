import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const indexPath = path.join(root, 'src/index.ts');
const componentsDir = path.join(root, 'src/components');
const layoutDir = path.join(root, 'src/layout');
const loginScreenPath = path.join(root, 'src/login-screen.tsx');
const storiesDir = path.join(root, 'stories');

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

async function listStemNames(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
    .map((entry) => entry.name.replace(/\.tsx$/, ''))
    .sort((a, b) => a.localeCompare(b));
}

function reportMissing(label, values) {
  if (values.length === 0) {
    return;
  }

  console.error(label);
  for (const value of values) {
    console.error(`  - ${value}`);
  }
}

async function main() {
  const [indexSource, componentNames, layoutNames, storyPaths] = await Promise.all([
    fs.readFile(indexPath, 'utf8'),
    listStemNames(componentsDir),
    listStemNames(layoutDir),
    walk(storiesDir)
  ]);
  const stories = storyPaths.filter((file) => file.endsWith('.stories.tsx'));
  const storySources = await Promise.all(stories.map((file) => fs.readFile(file, 'utf8')));

  const missingComponentExports = componentNames.filter((name) => !indexSource.includes(`./components/${name}`));
  const missingComponentStories = componentNames.filter((name) => !storySources.some((source) => source.includes(`src/components/${name}`)));

  const missingLayoutExports = layoutNames.filter((name) => !indexSource.includes(`./layout/${name}`));
  const missingLayoutStories = layoutNames.filter((name) => !storySources.some((source) => source.includes(`src/layout/${name}`)));

  const loginScreenExists = await fs
    .access(loginScreenPath)
    .then(() => true)
    .catch(() => false);
  const missingLoginScreenExport = loginScreenExists && !indexSource.includes('./login-screen') ? ['login-screen'] : [];
  const missingLoginScreenStory = loginScreenExists && !storySources.some((source) => source.includes('src/login-screen')) ? ['login-screen'] : [];

  const hasFailures =
    missingComponentExports.length > 0 ||
    missingComponentStories.length > 0 ||
    missingLayoutExports.length > 0 ||
    missingLayoutStories.length > 0 ||
    missingLoginScreenExport.length > 0 ||
    missingLoginScreenStory.length > 0;

  if (!hasFailures) {
    console.log('[check-exports-and-stories] All components/layouts are exported and covered by stories.');
    return;
  }

  console.error('[check-exports-and-stories] Validation failed.');
  reportMissing('Missing component exports in src/index.ts:', missingComponentExports);
  reportMissing('Missing component story coverage:', missingComponentStories);
  reportMissing('Missing layout exports in src/index.ts:', missingLayoutExports);
  reportMissing('Missing layout story coverage:', missingLayoutStories);
  reportMissing('Missing src/login-screen export in src/index.ts:', missingLoginScreenExport);
  reportMissing('Missing src/login-screen story coverage:', missingLoginScreenStory);
  process.exitCode = 1;
}

main().catch((error) => {
  console.error('[check-exports-and-stories] Failed:', error);
  process.exitCode = 1;
});
