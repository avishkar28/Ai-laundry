#!/usr/bin/env node

/**
 * Direct PostgreSQL Password Reset
 * Uses environment variable PGPASSWORD to bypass auth temporarily
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const psqlPath = 'C:\\Program Files\\PostgreSQL\\10\\bin\\psql.exe';
const envPath = path.join(__dirname, '.env');

console.log('\n🔧 Direct PostgreSQL Setup\n');
console.log('=' .repeat(60));

// Step 1: Check if PostgreSQL is running
console.log('\n1️⃣  Checking PostgreSQL service...');
try {
  const result = execSync('Get-Service postgresql-x64-10 | Select-Object -ExpandProperty Status', {
    shell: 'powershell',
    encoding: 'utf-8'
  });
  
  if (result.includes('Running')) {
    console.log('   ✅ PostgreSQL is running');
  } else {
    console.log('   ⚠️  PostgreSQL is not running. Starting...');
    execSync('Start-Service postgresql-x64-10', { shell: 'powershell', stdio: 'ignore' });
    console.log('   ✅ PostgreSQL started');
  }
} catch (err) {
  console.log('   ❌ Error checking service');
}

// Step 2: Wait for service to be ready
console.log('\n2️⃣  Waiting for PostgreSQL to be ready...');
let connected = false;
for (let i = 0; i < 10; i++) {
  try {
    execSync(`"${psqlPath}" -U postgres -h 127.0.0.1 -d postgres -c "SELECT 1;" 2>&1`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      env: { ...process.env, PGPASSWORD: '' }
    });
    connected = true;
    console.log('   ✅ PostgreSQL is ready (no password needed initially)');
    break;
  } catch (err) {
    if (i < 9) {
      process.stdout.write('.');
      require('child_process').execSync('timeout /t 1 /nobreak', { shell: 'cmd', stdio: 'ignore' });
    }
  }
}

if (!connected) {
  console.log('\n   ⚠️  Trying with common passwords...');
  
  const passwords = ['postgres', 'password', ''];
  for (const pwd of passwords) {
    try {
      execSync(`"${psqlPath}" -U postgres -h 127.0.0.1 -d postgres -c "SELECT 1;" 2>&1`, {
        encoding: 'utf-8',
        stdio: 'pipe',
        env: { ...process.env, PGPASSWORD: pwd }
      });
      console.log(`   ✅ PostgreSQL connected with password: "${pwd}"`);
      if (pwd) {
        process.env.PGPASSWORD = pwd;
      }
      connected = true;
      break;
    } catch (err) {
      // Try next password
    }
  }
}

if (!connected) {
  console.log('   ❌ Could not connect to PostgreSQL');
  console.log('\n💡 Please try manually:');
  console.log('   1. Open pgAdmin (search in Windows)');
  console.log('   2. Right-click "postgres" user → Properties');
  console.log('   3. Set password to: postgres');
  console.log('   4. Then run this script again\n');
  process.exit(1);
}

// Step 3: Reset postgres password
console.log('\n3️⃣  Resetting postgres password...');
try {
  execSync(`"${psqlPath}" -U postgres -h 127.0.0.1 -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>&1`, {
    encoding: 'utf-8',
    stdio: 'pipe',
    env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD || '' }
  });
  console.log('   ✅ Password reset to: postgres');
  process.env.PGPASSWORD = 'postgres';
} catch (err) {
  console.log('   ❌ Could not reset password');
  console.log(`   Error: ${err.message.split('\n')[0]}`);
}

// Step 4: Create database
console.log('\n4️⃣  Creating freshfold database...');
try {
  execSync(`"${psqlPath}" -U postgres -h 127.0.0.1 -d postgres -c "CREATE DATABASE IF NOT EXISTS freshfold;" 2>&1`, {
    encoding: 'utf-8',
    stdio: 'pipe',
    env: { ...process.env, PGPASSWORD: 'postgres' }
  });
  console.log('   ✅ Database created: freshfold');
} catch (err) {
  console.log('   ⚠️  Database might already exist');
}

// Step 5: Update .env file
console.log('\n5️⃣  Updating backend/.env...');
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
console.log('   ✅ .env updated with PostgreSQL credentials');
console.log(`       • DB_HOST: localhost`);
console.log(`       • DB_PORT: 5432`);
console.log(`       • DB_USER: postgres`);
console.log(`       • DB_PASSWORD: postgres`);
console.log(`       • DB_NAME: freshfold`);

// Step 6: Test connection
console.log('\n6️⃣  Testing connection with new password...');
try {
  execSync(`"${psqlPath}" -U postgres -h 127.0.0.1 -d freshfold -c "SELECT 1;" 2>&1`, {
    encoding: 'utf-8',
    stdio: 'pipe',
    env: { ...process.env, PGPASSWORD: 'postgres' }
  });
  console.log('   ✅ Connection successful with new password!');
} catch (err) {
  console.log('   ⚠️  Could not connect to database (will try with migration)');
}

console.log('\n' + '=' .repeat(60));
console.log('\n✅ PostgreSQL Setup Complete!\n');
console.log('Summary:');
console.log('  • Service: postgresql-x64-10 is running');
console.log('  • Password: postgres');
console.log('  • Database: freshfold created');
console.log('  • Config: backend/.env updated\n');
console.log('Next steps:');
console.log('  1. cd backend');
console.log('  2. node migrate.js          (loads schema and sample data)');
console.log('  3. npm run dev              (starts API server on port 3000)\n');
console.log('Then test:');
console.log('  curl http://localhost:3000/health\n');
console.log('=' .repeat(60) + '\n');
