import { build } from 'esbuild';
import { readdir, copyFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const copyTypes = async () => {
    try {
        await mkdir(join(__dirname, 'lib', 'types'), { recursive: true });

        const typeFiles = await readdir(join(__dirname, '@types'));

        for (const file of typeFiles) {
            if (file.endsWith('.d.ts')) {
                await copyFile(join(__dirname, '@types', file), join(__dirname, 'lib', 'types', file));
            }
        }
    } catch (error) {
        console.error('Error copying types:', error.message);
    }
};

const buildLib = async () => {
    try {
        await build({
            entryPoints: ['src/index.js'],
            bundle: true,
            outdir: 'lib',
            format: 'esm',
            platform: 'node',
            target: 'node16',
            external: ['puppeteer-extra', 'puppeteer-extra-plugin-stealth', 'puppeteer-extra-plugin-user-preferences', 'rebrowser-puppeteer', 'fs'],
            preserveSymlinks: true,
            sourcemap: true
        });
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

const main = async () => {
    await Promise.all([buildLib(), copyTypes()]);
};

main().catch(console.error);
