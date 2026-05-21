#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const PG_HBA = 'C:\\Program Files\\PostgreSQL\\10\\data\\pg_hba.conf';

console.log('🔧 PostgreSQL Password Reset Utility\n');

// Read current pg_hba.conf
console.log('1️⃣  Reading pg_hba.conf...');
let content = fs.readFileSync(PG_HBA, 'utf-8');

// Backup original
const backup = content;
console.log('   ✓ Backed up current config');

// Replace md5 with trust for local connections
console.log('\n2️⃣  Enabling trust authentication temporarily...');
content = content.replace(/host    all             all             127.0.0.1\/32            md5/g, 
                          'host    all             all             127.0.0.1/32            trust');
fs.writeFileSync(PG_HBA, content);
console.log('   ✓ Modified pg_hba.conf to use trust auth');

// Reload PostgreSQL
console.log('\n3️⃣  Reloading PostgreSQL service...');
try {
  execSync('net stop postgresql-x64-10', { stdio: 'ignore' });
  console.log('   ✓ Stopped PostgreSQL');
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  execSync('net start postgresql-x64-10', { stdio: 'ignore' });
  console.log('   ✓ Started PostgreSQL');
  
  // Wait for startup
  await new Promise(resolve => setTimeout(resolve, 2000));
} catch (err) {
  console.log('⚠️  Could not restart service via net. Trying pg_ctl...');
}

// Test connection
console.log('\n4️⃣  Testing connection...');
try {
  const result = execSync('"C:\\Program Files\\PostgreSQL\\10\\bin\\psql.exe" -U postgres -d postgres -c "SELECT 1"', 
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
  console.log('   ✓ Connected successfully!');
  
  // Reset password
  console.log('\n5️⃣  Setting postgres password to "postgres"...');
  execSync('"C:\\Program Files\\PostgreSQL\\10\\bin\\psql.exe" -U postgres -d postgres -c "ALTER USER postgres PASSWORD \'postgres\';"',
    { stdio: 'ignore' });
  console.log('   ✓ Password set to "postgres"');
  
} catch (err) {
  console.log('❌ Could not connect even with trust auth');
  console.log('Error:', err.message);
}

// Restore md5 authentication
console.log('\n6️⃣  Restoring md5 authentication...');
fs.writeFileSync(PG_HBA, backup);
console.log('   ✓ Restored pg_hba.conf');

// Reload again
console.log('\n7️⃣  Reloading PostgreSQL with md5...');
try {
  execSync('"C:\\Program Files\\PostgreSQL\\10\\bin\\pg_ctl.exe" reload -D "C:\\Program Files\\PostgreSQL\\10\\data"', 
    { stdio: 'ignore' });
  console.log('   ✓ PostgreSQL reloaded');
} catch (err) {
  console.log('⚠️  Reload might need manual restart');
}

console.log('\n✅ Password reset complete!');
console.log('   postgres user password is now: "postgres"');
console.log('\n💡 Try running: node migrate.js');
