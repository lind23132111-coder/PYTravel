import fs from 'fs';
import path from 'path';

/**
 * sync-docs.mjs
 * 
 * This script is intended to sync documentation from the brain/ folder
 * to a local Wiki or PR description files to maintain an "Automation First" workflow.
 */

const BRAIN_DIR = '/Users/kigochen/.gemini/antigravity/brain/86d1a564-aef5-43a0-8dc8-9af95faad842';
const WIKI_DIR = path.resolve('docs/wiki'); // Adjust as needed

function syncFile(filename) {
    const source = path.join(BRAIN_DIR, filename);
    const target = path.join(WIKI_DIR, filename);

    if (fs.existsSync(source)) {
        if (!fs.existsSync(WIKI_DIR)) {
            fs.mkdirSync(WIKI_DIR, { recursive: true });
        }
        fs.copyFileSync(source, target);
        console.log(`[SYNC] Copied ${filename} to ${target}`);
    } else {
        console.warn(`[SYNC] Source not found: ${source}`);
    }
}

// Initial sync list
['task.md', 'implementation_plan.md'].forEach(syncFile);
