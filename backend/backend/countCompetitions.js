require('dotenv').config();
const mongoose = require('mongoose');

async function count() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/web-dan-database';
  await mongoose.connect(uri);
  const coll = mongoose.connection.collection('competitions');
  const total = await coll.countDocuments({});
  const approved = await coll.countDocuments({ status: 'approved' });
  console.log('total:', total, 'approved:', approved);
  await mongoose.disconnect();
}

count().catch(err => { console.error(err); process.exit(1); });
