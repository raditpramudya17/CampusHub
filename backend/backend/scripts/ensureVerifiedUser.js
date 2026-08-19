const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 1) {
    console.error('Usage: node ensureVerifiedUser.js <username> [password] [email] [firstName] [lastName]');
    process.exit(2);
  }
  const username = argv[0];
  const password = argv[1] || 'Password123!';
  const email = argv[2] || `${username}@example.local`;
  const firstName = argv[3] || 'Auto';
  const lastName = argv[4] || 'Test';

  // read .env for MONGODB_URI if present
  let mongoUri = 'mongodb://localhost:27017/web-dan-database';
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const m = content.match(/MONGODB_URI=(.*)/);
      if (m) mongoUri = m[1].trim();
    }
  } catch (e) {
    console.warn('Failed to read .env, using default mongo uri', e.message);
  }

  console.log('Connecting to', mongoUri);
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db();
  const users = db.collection('users');

  const hashed = await bcrypt.hash(password, 10);
  const now = new Date();

  const existing = await users.findOne({ username });
  if (existing) {
    console.log('User exists, updating password+isVerified');
    await users.updateOne({ username }, { $set: { password: hashed, isVerified: true, email, firstName, lastName, updatedAt: now } });
    console.log('Updated user:', username);
  } else {
    console.log('Creating user', username);
    await users.insertOne({
      firstName,
      lastName,
      email,
      username,
      password: hashed,
      gender: 'male',
      role: 'mahasiswa',
      isVerified: true,
      verificationCode: null,
      createdAt: now,
      updatedAt: now
    });
    console.log('Created user:', username);
  }
  await client.close();
  console.log('Done');
}

main().catch(err => { console.error(err); process.exit(1); });
