import { neon } from '@neondatabase/serverless';
import fs from 'fs';

// Read DATABASE_URL from .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/DATABASE_URL="?([^"\n\r]+)"?/);
if (!match) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const databaseUrl = match[1];
const sql = neon(databaseUrl);

const schemaSql = fs.readFileSync('src/lib/db/schema.sql', 'utf-8');

async function migrate() {
  console.log('Connecting to Neon branch and applying schema...');
  // Strip comments and split by semicolon
  const cleanSql = schemaSql
    .replace(/--.*$/gm, '')
    .trim();

  const statements = cleanSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log(`Successfully executed ${statements.length} DDL statements on Neon!`);
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
