#!/usr/bin/env node

const { Client } = require('pg');

// Try common passwords
const passwords = [
  'postgres',    // default
  '',            // empty
  'password',
  '1234',
  'admin'
];

const testConnections = async () => {
  console.log('🔍 Testing PostgreSQL connections...\n');
  
  for (const pwd of passwords) {
    try {
      const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: pwd,
        database: 'postgres',
        statement_timeout: 5000
      });
      
      await client.connect();
      console.log(`✅ SUCCESS with password: "${pwd}"`);
      
      // Test query
      const res = await client.query('SELECT version()');
      console.log(`   PostgreSQL Version: ${res.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
      
      await client.end();
      return pwd;
    } catch (err) {
      console.log(`❌ Failed with password: "${pwd}"`);
    }
  }
  
  console.log('\n⚠️  Could not connect with common passwords.');
  console.log('💡 Try resetting PostgreSQL password:');
  console.log('   1. Open Windows Services (services.msc)');
  console.log('   2. Right-click "postgresql-x64-10"');
  console.log('   3. Log On tab → Change password');
  console.log('   4. Or use pgAdmin to reset postgres user password');
  
  return null;
};

testConnections().catch(console.error);
