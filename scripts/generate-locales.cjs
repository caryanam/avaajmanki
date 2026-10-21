#!/usr/bin/env node
/**
 * scripts/generate-locales.cjs
 *
 * Build-time translation generator for Man Ki Aavaj frontend locales.
 * Translates src/locales/en.json into 17 target Indian languages using OpenAI.
 *
 * Features:
 * - Build-time only (never executed in browser)
 * - Uses OPENAI_API_KEY strictly from environment
 * - Configurable model via LOCALE_MODEL (default: gpt-4o)
 * - Disk caching with automatic invalidation when English source string changes
 * - Chunked requests (at most 40 keys per prompt)
 * - Preserves {{placeholders}}
 * - Post-generation parity & placeholder validation report
 */

const fs = require('fs');
const path = require('path');

const TARGET_LOCALES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ur', name: 'Urdu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'or', name: 'Odia' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'as', name: 'Assamese' },
  { code: 'sat', name: 'Santali' },
  { code: 'ks', name: 'Kashmiri' },
  { code: 'mni', name: 'Manipuri' },
  { code: 'doi', name: 'Dogri' },
  { code: 'bho', name: 'Bhojpuri' },
];

const CHUNK_SIZE = 40;
const CACHE_FILE = path.resolve(__dirname, '..', '.locale_translation_cache.json');
const LOCALES_DIR = path.resolve(__dirname, '..', 'src', 'locales');
const EN_PATH = path.join(LOCALES_DIR, 'en.json');
const MODEL = process.env.LOCALE_MODEL || 'gpt-4o';
const API_KEY = process.env.OPENAI_API_KEY;

// 1. Validate environment
if (!API_KEY) {
  console.error('\x1b[31m%s\x1b[0m', '=======================================================');
  console.error('\x1b[31m%s\x1b[0m', '  ERROR: OPENAI_API_KEY environment variable is not set!');
  console.error('\x1b[31m%s\x1b[0m', '=======================================================');
  console.error('\nTo run the locale generator, set your key and execute:');
  console.error('\x1b[36m%s\x1b[0m', '  PowerShell:');
  console.error('    $env:OPENAI_API_KEY="sk-..."; npm run i18n:generate\n');
  console.error('\x1b[36m%s\x1b[0m', '  Bash / Linux / macOS:');
  console.error('    OPENAI_API_KEY="sk-..." npm run i18n:generate\n');
  console.error('Optional: set LOCALE_MODEL to override the model (default: gpt-4o).\n');
  process.exit(1);
}

// 2. Helper functions for flattening and unflattening JSON
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, fullKey));
    } else {
      result[fullKey] = String(val);
    }
  }
  return result;
}

function unflattenObject(flat) {
  const result = {};
  for (const [fullKey, val] of Object.entries(flat)) {
    const parts = fullKey.split('.');
    let curr = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!curr[part] || typeof curr[part] !== 'object') {
        curr[part] = {};
      }
      curr = curr[part];
    }
    curr[parts[parts.length - 1]] = val;
  }
  return result;
}

function extractPlaceholders(str) {
  if (typeof str !== 'string') return [];
  const matches = str.match(/\{\{([^}]+)\}\}/g);
  return matches ? matches.map((m) => m.trim()).sort() : [];
}

// 3. Cache management
function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch (e) {
      console.warn('⚠️  Could not read cache file, starting with fresh cache.');
    }
  }
  return {};
}

function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (e) {
    console.warn('⚠️  Failed to write cache file:', e.message);
  }
}

// 4. OpenAI Chat API Call
async function callOpenAI(chunk, targetLocale, targetLanguage) {
  const systemPrompt = `You are a professional software translator specializing in Indian languages.
Translate the values in the following JSON object from English into ${targetLanguage} (locale code: '${targetLocale}').

CRITICAL RULES:
1. Maintain the exact same JSON keys.
2. DO NOT translate, modify, remove, or corrupt any {{placeholders}} like {{count}}, {{name}}, {{handle}}. They must appear exactly as {{placeholder}} in the translated string.
3. Keep brand names ('Man Ki Aavaj', 'Awaaj Pulse', 'Pulse', 'Editorial Wire') authentic and recognizable.
4. Use polite, conversational, culturally appropriate Indian wording for a community audio/text app.
5. Return ONLY a valid JSON object mapping the provided keys to translated strings. Do not output markdown, ticks, or explanations.`;

  const userPrompt = JSON.stringify(chunk, null, 2);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API error [${res.status}]: ${errorText}`);
  }

  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content || '{}';
  const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
  return JSON.parse(cleanJson);
}

// 5. Main generation loop
async function generateAll() {
  console.log(`\n🌐 Man Ki Aavaj — Locale Generator (Model: ${MODEL})\n`);

  if (!fs.existsSync(EN_PATH)) {
    console.error(`Master English file not found at: ${EN_PATH}`);
    process.exit(1);
  }

  const enRaw = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));
  const enFlat = flattenObject(enRaw);
  const totalKeys = Object.keys(enFlat).length;
  console.log(`📖 Loaded ${totalKeys} keys from en.json\n`);

  const cache = loadCache();

  for (const locale of TARGET_LOCALES) {
    const { code, name } = locale;
    const localeFile = path.join(LOCALES_DIR, `${code}.json`);
    console.log(`\n── [${code.toUpperCase()}] Generating ${name}... ──`);

    if (!cache[code]) cache[code] = {};

    // Load existing locale file if present to seed cache
    let existingLocaleFlat = {};
    if (fs.existsSync(localeFile)) {
      try {
        existingLocaleFlat = flattenObject(JSON.parse(fs.readFileSync(localeFile, 'utf8')));
      } catch (e) {}
    }

    const keysToTranslate = [];
    const resultMap = {};

    for (const [key, enText] of Object.entries(enFlat)) {
      const cached = cache[code][key];

      // Invalidation logic: if English source text changed, invalidate
      if (cached && cached.sourceEn === enText && cached.translated) {
        resultMap[key] = cached.translated;
      } else if (existingLocaleFlat[key] && existingLocaleFlat[key] !== enText && !cached) {
        // Seed from existing translated files
        resultMap[key] = existingLocaleFlat[key];
        cache[code][key] = { sourceEn: enText, translated: existingLocaleFlat[key] };
      } else {
        keysToTranslate.push(key);
      }
    }

    const cachedCount = Object.keys(resultMap).length;
    console.log(`  💾 Cached/Pre-existing: ${cachedCount}/${totalKeys} keys`);
    console.log(`  ⚡ To translate: ${keysToTranslate.length} keys`);

    // Chunk into batches of at most CHUNK_SIZE
    for (let i = 0; i < keysToTranslate.length; i += CHUNK_SIZE) {
      const chunkKeys = keysToTranslate.slice(i, i + CHUNK_SIZE);
      const chunk = {};
      chunkKeys.forEach((k) => {
        chunk[k] = enFlat[k];
      });

      console.log(`  ▶ Translating batch ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(keysToTranslate.length / CHUNK_SIZE)} (${chunkKeys.length} keys)...`);
      try {
        const translatedChunk = await callOpenAI(chunk, code, name);
        for (const [k, transText] of Object.entries(translatedChunk)) {
          resultMap[k] = transText;
          cache[code][k] = { sourceEn: enFlat[k], translated: transText };
        }
        saveCache(cache);
      } catch (err) {
        console.error(`  ❌ Batch failed for ${code}: ${err.message}`);
        // Fall back to English for missing keys in this chunk
        chunkKeys.forEach((k) => {
          if (!resultMap[k]) resultMap[k] = enFlat[k];
        });
      }
    }

    // Ensure all keys are populated (fallback to English if any missing)
    for (const [key, enText] of Object.entries(enFlat)) {
      if (!resultMap[key]) resultMap[key] = enText;
    }

    // Unflatten and write back to file
    const nested = unflattenObject(resultMap);
    fs.writeFileSync(localeFile, JSON.stringify(nested, null, 2), 'utf8');
    console.log(`  ✅ Written to src/locales/${code}.json`);
  }

  saveCache(cache);

  // 6. Validation Report
  runValidationReport(enFlat);
}

function runValidationReport(enFlat) {
  console.log('\n=======================================================');
  console.log('             LOCALE VALIDATION REPORT                  ');
  console.log('=======================================================\n');

  const enTotal = Object.keys(enFlat).length;
  console.log(`Master (en.json): ${enTotal} keys total.\n`);

  let allClean = true;

  console.log('| Locale | Code | Keys Present | Missing Keys | Bad Placeholders | Status |');
  console.log('|--------|------|--------------|--------------|------------------|--------|');

  for (const locale of TARGET_LOCALES) {
    const { code, name } = locale;
    const localeFile = path.join(LOCALES_DIR, `${code}.json`);

    if (!fs.existsSync(localeFile)) {
      console.log(`| ${name.padEnd(6)} | ${code.padEnd(4)} | MISSING FILE | - | - | ❌ FAIL |`);
      allClean = false;
      continue;
    }

    const locFlat = flattenObject(JSON.parse(fs.readFileSync(localeFile, 'utf8')));
    const locKeys = Object.keys(locFlat);

    const missingKeys = [];
    const badPlaceholders = [];

    for (const [key, enVal] of Object.entries(enFlat)) {
      if (!(key in locFlat)) {
        missingKeys.push(key);
      } else {
        const enPh = extractPlaceholders(enVal);
        const locPh = extractPlaceholders(locFlat[key]);
        if (JSON.stringify(enPh) !== JSON.stringify(locPh)) {
          badPlaceholders.push({ key, expected: enPh, got: locPh });
        }
      }
    }

    const isPass = missingKeys.length === 0 && badPlaceholders.length === 0;
    if (!isPass) allClean = false;

    const statusBadge = isPass ? '✅ PASS' : '⚠️ WARN';
    console.log(
      `| ${name.padEnd(6)} | ${code.padEnd(4)} | ${String(locKeys.length).padEnd(12)} | ${String(missingKeys.length).padEnd(12)} | ${String(badPlaceholders.length).padEnd(16)} | ${statusBadge} |`
    );

    if (badPlaceholders.length > 0) {
      console.log(`    ↳ Placeholder mismatches for ${code}:`);
      badPlaceholders.slice(0, 5).forEach((b) => {
        console.log(`      • ${b.key}: expected [${b.expected.join(', ')}], got [${b.got.join(', ')}]`);
      });
      if (badPlaceholders.length > 5) {
        console.log(`      ... and ${badPlaceholders.length - 5} more.`);
      }
    }
  }

  console.log('\n=======================================================');
  if (allClean) {
    console.log('🎉 ALL LOCALES MATCH MASTER en.json PERFECTLY!');
  } else {
    console.log('⚠️  SOME LOCALES HAVE MISSING KEYS OR PLACEHOLDER MISMATCHES.');
  }
  console.log('=======================================================\n');
}

// Run
generateAll().catch((err) => {
  console.error('Fatal generation error:', err);
  process.exit(1);
});
