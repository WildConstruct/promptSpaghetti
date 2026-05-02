'use strict';
const fs = require('fs');
const path = require('path');

function toTitleCase(name) {
  return name
    // insert space between lowerCase and UpperCase (camelCase -> camel Case)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // normalize separators to spaces
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    // title case first letter of each word, lower the rest
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ');
}

/**
 * Collect graph entries from a directory containing .psg files.
 * @param {string} dir absolute or relative directory path
 * @returns {Promise<Array<{ filename: string; title: string; updatedAt?: string; tags?: string[] }>>}
 */
async function collectGraphEntries(dir) {
  const abs = path.resolve(dir);
  let files;
  try {
    files = await fs.promises.readdir(abs, { withFileTypes: true });
  } catch (e) {
    // if directory does not exist, treat as empty
    return [];
  }
  const entries = [];
  for (const d of files) {
    if (!d.isFile()) continue;
    if (!d.name.toLowerCase().endsWith('.psg')) continue;
    const filename = d.name;
    const filePath = path.join(abs, filename);
    // Validate .psg file using psgCodec if available, fallback to basic validation
    let extractedTags = [];
    let extractedTitle = null;
    let extractedUpdatedAt = undefined;
    try {
      const raw = await fs.promises.readFile(filePath, 'utf8');
      
      // Try to use psgCodec for proper validation
      try {
        // Attempt to load the psgCodec from core package
        const { readPsg } = require('../../../core/utils/psgCodec');
        const psgFile = readPsg(raw);
        // Validation passed, extract metadata if available
        if (psgFile.meta?.tags && Array.isArray(psgFile.meta.tags)) {
          extractedTags = psgFile.meta.tags;
        }
        if (psgFile.meta?.name) {
          extractedTitle = psgFile.meta.name;
        }
        if (typeof psgFile.meta?.updatedAt === 'string') {
          extractedUpdatedAt = psgFile.meta.updatedAt;
        }
      } catch (codecError) {
        // Fallback to basic validation if codec not available or validation fails
        const json = JSON.parse(raw);
        
        // Check for PSG v1.0 format
        if (json.version && json.kind === 'graph' && json.graph) {
          // PSG format, validate graph structure
          if (!json.graph.nodes || !Array.isArray(json.graph.nodes) || 
              !json.graph.edges || !Array.isArray(json.graph.edges)) {
            // eslint-disable-next-line no-console
            console.warn(`[manifest] Skipping invalid .psg (malformed graph structure): ${filename}`);
            continue;
          }
          // Extract metadata from PSG format
          if (json.meta?.tags && Array.isArray(json.meta.tags)) {
            extractedTags = json.meta.tags;
          }
          if (json.meta?.name) {
            extractedTitle = json.meta.name;
          }
          if (typeof json.meta?.updatedAt === 'string') {
            extractedUpdatedAt = json.meta.updatedAt;
          }
        } else if (json.nodes && json.edges) {
          // Legacy format, basic validation
          if (!Array.isArray(json.nodes) || !Array.isArray(json.edges)) {
            // eslint-disable-next-line no-console
            console.warn(`[manifest] Skipping invalid .psg (missing nodes/edges arrays): ${filename}`);
            continue;
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn(`[manifest] Skipping invalid .psg (unrecognized format): ${filename}`);
          continue;
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`[manifest] Skipping invalid .psg (parse/validation failed): ${filename} - ${e.message}`);
      continue;
    }
    const base = path.basename(filename, path.extname(filename));
    const title = extractedTitle || toTitleCase(base);
    const entry = {
      filename,
      title,
      tags: extractedTags
    };
    if (extractedUpdatedAt) {
      entry.updatedAt = extractedUpdatedAt;
    }
    entries.push(entry);
  }
  // deterministic sort by title asc
  entries.sort((a, b) => a.title.localeCompare(b.title));
  return entries;
}

module.exports = { collectGraphEntries, toTitleCase };
