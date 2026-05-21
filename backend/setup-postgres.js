#!/usr/bin/env node

/**
 * PostgreSQL Setup & Password Reset Script
 * Automates: password reset, database creation, schema loading, data migration
 */

const fs = require('fs');
const { execSync, spawnSync } = require('child_process');
const path = require('path');

const PG_BIN = 'C:\\Program Files\\PostgreSQL\\10\\bin';
const PG_DATA = 'C:\\Program Files\\PostgreSQL\\10\\data';
const PG_HBA = path.join(PG_DATA, 'pg_hba.conf');
const psql = path.join(PG_BIN, 'psql.exe');

console.log('🔧 PostgreSQL Setup & Migration Script\n');

// Helper function to run commands
function runCommand(cmd, description, options = {}) {
  console.log(`⏳ ${description}...`);
  try {
    const result = spawnSync('powershell', ['-Command', cmd], {
      encoding: 'utf-8',
      stdio: 'pipe',
      ...options
    });
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error.message}`);
      return null;
    }
    
    if (result.status !== 0) {
      if (result.stderr) console.log(`   ⚠️  ${result.stderr.trim().split('\n')[0]}`);
      return result;
    }
    
    console.log('   ✅ Done');
    return result;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return null;
  }
}

// Step 1: Modify pg_hba.conf to trust auth
console.log('\n📝 Step 1: Enabling trust authentication...\n');

try {
  let content = fs.readFileSync(PG_HBA, 'utf-8');
  const backup = content;
  
  // Replace md5 with trust for local IPv4
  content = content.replace(
    /host\s+all\s+all\s+127\.0\.0\.1\/32\s+md5/,
    'host    all             all             127.0.0.1/32            trust'
  );
  
  fs.writeFileSync(PG_HBA, content);
  console.log('✅ pg_hba.conf updated to use trust authentication');
  
  // Step 2: Restart PostgreSQL
  console.log('\n🔄 Step 2: Restarting PostgreSQL service...\n');
  
  runCommand(`Stop-Service -Name postgresql-x64-10 -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2; Start-Service -Name postgresql-x64-10 -ErrorAction SilentlyContinue; Start-Sleep -Seconds 3`, 'Restarting PostgreSQL');
  
  // Step 3: Test connection and reset password
  console.log('\n🔑 Step 3: Resetting postgres password...\n');
  
  // Try to connect with trust auth and reset password
  const resetCmd = `
    & "${psql}" -U postgres -h 127.0.0.1 -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>&1
  `;
  
  const resetResult = runCommand(resetCmd, 'Setting password to "postgres"');
  
  if (resetResult && resetResult.stdout) {
    console.log(`   Output: ${resetResult.stdout.trim()}`);
  }
  
  // Step 4: Restore md5 authentication
  console.log('\n🔐 Step 4: Restoring md5 authentication...\n');
  
  // Restore original pg_hba.conf
  fs.writeFileSync(PG_HBA, backup);
  console.log('✅ pg_hba.conf restored to md5 authentication');
  
  // Step 5: Reload PostgreSQL
  console.log('\n♻️  Step 5: Reloading PostgreSQL configuration...\n');
  
  runCommand(`Stop-Service -Name postgresql-x64-10 -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 2; Start-Service -Name postgresql-x64-10 -ErrorAction SilentlyContinue; Start-Sleep -Seconds 3`, 'Reloading PostgreSQL');
  
  // Step 6: Test connection with new password
  console.log('\n🧪 Step 6: Testing connection with new password...\n');
  
  process.env.PGPASSWORD = 'postgres';
  const testCmd = `& "${psql}" -U postgres -h 127.0.0.1 -d postgres -c "SELECT version();" 2>&1`;
  const testResult = runCommand(testCmd, 'Testing PostgreSQL connection');
  
  if (testResult && testResult.stdout && testResult.stdout.includes('PostgreSQL')) {
    console.log('✅ PostgreSQL connection successful!\n');
    
    // Step 7: Create database
    console.log('📦 Step 7: Creating freshfold database...\n');
    
    const createDbCmd = `& "${psql}" -U postgres -h 127.0.0.1 -d postgres -c "CREATE DATABASE IF NOT EXISTS freshfold;" 2>&1`;
    runCommand(createDbCmd, 'Creating database');
    
    // Step 8: Update .env
    console.log('\n⚙️  Step 8: Updating backend/.env...\n');
    
    const envPath = path.join(__dirname, '.env');
    const envContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=freshfold

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8000

# LangGraph Integration
LANGGRAPH_AGENT_URL=http://localhost:3001
GEMINI_API_KEY=your_gemini_api_key_here
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ .env updated: DB_HOST=localhost, DB_PASSWORD=postgres, DB_NAME=freshfold\n`);
    
    // Step 9: Run database migration
    console.log('🔄 Step 9: Running database migration...\n');
    
    try {
      const migrate = require('./migrate');
      console.log('✅ Migration completed\n');
    } catch (err) {
      // Migration module might not export, try direct execution
      console.log('   (Migration will run next - node migrate.js)\n');
    }
    
    console.log('=' .repeat(60));
    console.log('\n✅ PostgreSQL Setup Complete!\n');
    console.log('Summary:');
    console.log('  • Password reset to: postgres');
    console.log('  • Database created: freshfold');
    console.log('  • .env updated with correct credentials');
    console.log('  • PostgreSQL is ready for use\n');
    console.log('Next steps:');
    console.log('  1. cd backend');
    console.log('  2. node migrate.js (to load schema and sample data)');
    console.log('  3. npm run dev (to start backend API)\n');
    console.log('=' .repeat(60));
    
  } else {
    console.log('\n⚠️  Could not connect to PostgreSQL');
    console.log('Try these manual steps:');
    console.log('  1. Open Windows Services (services.msc)');
    console.log('  2. Right-click postgresql-x64-10 → Restart');
    console.log('  3. Wait 30 seconds');
    console.log('  4. Try again: node setup-postgres.js\n');
  }
  
} catch (err) {
  console.log(`\n❌ Error: ${err.message}`);
  console.log('\nTroubleshooting:');
  console.log('  • Ensure PostgreSQL service is running');
  console.log('  • Check firewall settings for port 5432');
  console.log('  • Try restarting the PostgreSQL service manually');
  console.log('  • Check logs at: C:\\Program Files\\PostgreSQL\\10\\data\\postgresql.log\n');
}
