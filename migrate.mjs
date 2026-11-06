// Migration runner fudud: fuliya db/migrations/*.sql si kala horreeya, mid kasta transaction gaar ah.
// - Advisory lock: laba instance isku mar ma socon karaan.
// - Checksum: migration hore la fuliyay haddii la wax-ka-beddelo => KHALAD (ha dib-u-qorin migration hore; samee mid cusub).
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = process.env.MIGRATIONS_DIR ?? path.join(here, '..', 'db', 'migrations');

// Haddii DATABASE_URL aan la dejin, isku day .env (bilaabka dev). Ma dib-qoro env jira.
if (!process.env.DATABASE_URL && typeof process.loadEnvFile === 'function') {
  for (const f of ['.env', '../../.env']) {
    try {
      process.loadEnvFile(f);
    } catch {
      /* ma jiro */
    }
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('KHALAD: DATABASE_URL lama dejin (eeg .env.example / make init).');
  process.exit(1);
}

const LOCK_KEY = 727001; // lambar ikhtiyaari oo ah furaha lock-ga
const client = new pg.Client({ connectionString: url });

async function main() {
  await client.connect();
  await client.query('SELECT pg_advisory_lock($1)', [LOCK_KEY]);
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      checksum   TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);

  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  const { rows } = await client.query('SELECT filename, checksum FROM schema_migrations');
  const applied = new Map(rows.map((r) => [r.filename, r.checksum]));

  let ran = 0;
  for (const file of files) {
    const sql = await readFile(path.join(dir, file), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    if (applied.has(file)) {
      if (applied.get(file) !== checksum) {
        throw new Error(`Migration "${file}" waa la beddelay kadib markii la fuliyay. Samee migration cusub; ha wax-ka-beddelin kuwa hore.`);
      }
      continue;
    }
    console.log(`→ ${file}`);
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)', [file, checksum]);
      await client.query('COMMIT');
      ran++;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw new Error(`Migration "${file}" way fashilantay: ${err.message}`);
    }
  }
  console.log(ran === 0 ? 'Wax cusub ma jiraan — database-ku waa casri.' : `Dhammaad: ${ran} migration la fuliyay.`);
}

main()
  .catch((err) => {
    console.error('KHALAD:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => undefined);
  });
