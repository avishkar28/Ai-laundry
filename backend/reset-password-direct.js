#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const psqlPath = 'C:\\Program Files\\PostgreSQL\\10\\bin\\psql.exe';

console.log('🔄 Attempting password reset...\n');

// Set environment variable for no password (trust auth)
process.env.PGPASSWORD = '';

try {
  // Test connection first
  console.log('1️⃣  Testing connection with trust auth...');
  const test = execSync(`"${psqlPath}" -U postgres -h 127.0.0.1 -d postgres -c "SELECT version();" 2>&1`, {
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  console.log('   ✅ Connected!\n');
  
  // Reset password
  console.log('2️⃣  Setting postgres password to "postgres"...');
  execSync(`"${psqlPath}" -U postgres -h 127.0.0.1 -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>&1`, {
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  console.log('   ✅ Password set!\n');
  
  // Verify new password works
  process.env.PGPASSWORD = 'postgres';
  console.log('3️⃣  Testing new password...');
  const verify = execSync(`"${psqlPath}" -U postgres -h 127.0.0.1 -d postgres -c "SELECT 1;" 2>&1`, {
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  console.log('   ✅ New password works!\n');
  
  console.log('✅ Password reset successful!');
  console.log('   postgres password is now: "postgres"\n');
  
  console.log('💡 Try running: node migrate.js');
  
} catch (err) {
  console.log('❌ Error:', err.message);
  console.log('\nNote: If trust auth isn\'t working, the pg_hba.conf changes might need:');
  console.log('1. PostgreSQL service restart (requires admin)');
  console.log('2. Or manual intervention in pgAdmin');
}
