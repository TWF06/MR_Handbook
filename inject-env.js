const fs = require('fs');
const path = require('path');

// 1. Manually parse .env file if it exists (no external dependencies needed)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key && val && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

// 2. Inject environment variables into db.js
const dbPath = path.join(__dirname, 'db.js');
if (fs.existsSync(dbPath)) {
  let dbContent = fs.readFileSync(dbPath, 'utf8');

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  let replaced = false;

  if (url) {
    dbContent = dbContent.replace(
      /(const\s+supabaseUrl\s*=\s*['"])(.*?)(['"];)/,
      (match, p1, p2, p3) => {
        if (p2 !== url) {
          replaced = true;
          return `${p1}${url}${p3}`;
        }
        return match;
      }
    );
  }
  if (key) {
    dbContent = dbContent.replace(
      /(const\s+supabaseKey\s*=\s*['"])(.*?)(['"];)/,
      (match, p1, p2, p3) => {
        if (p2 !== key) {
          replaced = true;
          return `${p1}${key}${p3}`;
        }
        return match;
      }
    );
  }

  if (replaced) {
    fs.writeFileSync(dbPath, dbContent, 'utf8');
    console.log('Successfully injected environment variables into db.js');
  } else {
    console.log('No database connection settings changed or variables were already up to date.');
  }
} else {
  console.error('db.js not found!');
  process.exit(1);
}
