import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const match = envContent.match(/DATABASE_URL="?([^"\n\r]+)"?/);
const sql = neon(match[1]);

async function verify() {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  console.log('Tables verified in Neon Postgres:');
  tables.forEach((t) => console.log(' -', t.table_name));
}

verify().catch(console.error);
