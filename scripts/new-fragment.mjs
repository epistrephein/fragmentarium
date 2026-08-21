import { access, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const storyDirectory = path.join(process.cwd(), 'src', 'content', 'story');
const dryRun = process.argv.includes('--dry-run');

const today = new Date();
const published = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-');

const files = (await readdir(storyDirectory)).filter((file) => file.endsWith('.md'));
const orders = await Promise.all(
  files.map(async (file) => {
    const source = await readFile(path.join(storyDirectory, file), 'utf8');
    const match = source.match(/^order:\s*(\d+)\s*$/m);

    if (!match) {
      throw new Error(`Missing frontmatter order in ${file}`);
    }

    return Number(match[1]);
  }),
);

const nextOrder = Math.max(0, ...orders) + 1;
const fileName = `fragment-${String(nextOrder).padStart(3, '0')}.md`;
const filePath = path.join(storyDirectory, fileName);
const contents = `---
order: ${nextOrder}
published: ${published}
description: Add a fragment description here.
draft: true
---

Write here the body of the fragment.
`;

try {
  await access(filePath);
  throw new Error(`Refusing to overwrite existing file: ${fileName}`);
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

if (dryRun) {
  console.log(`Would create src/content/story/${fileName}`);
} else {
  await writeFile(filePath, contents, 'utf8');
  console.log(`Created src/content/story/${fileName}`);
}
