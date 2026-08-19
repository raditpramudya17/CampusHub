require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/web-dan-database';
  await mongoose.connect(uri);
  const coll = mongoose.connection.collection('competitions');

  const now = new Date();
  const docs = [
    {
      title: 'LKTI Nasional Green Campus 2026',
      description: 'Kompetisi karya tulis ilmiah nasional untuk gagasan kampus berkelanjutan.',
      category: 'akademik',
      organizer: 'BEM Universitas Muhammadiyah Makassar',
      registrationDeadline: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      eventDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      prize: 'Rp15 juta + sertifikat',
      requirements: 'Mahasiswa aktif, tim 2-3 orang',
      registrationLink: 'https://campushub.local/lkti-green-campus',
      author: new mongoose.Types.ObjectId(),
      status: 'approved',
      createdAt: now,
      updatedAt: now
    },
    {
      title: 'Hackathon Smart City Makassar',
      description: 'Bangun prototipe web/mobile untuk transportasi dan pelayanan publik.',
      category: 'teknologi',
      organizer: 'UKM Informatika Unismuh',
      registrationDeadline: new Date(Date.now() + 3 * 24 * 3600 * 1000),
      eventDate: new Date(Date.now() + 20 * 24 * 3600 * 1000),
      prize: 'Rp25 juta + mentoring',
      requirements: 'Tim 3-4 orang',
      registrationLink: 'https://campushub.local/hackathon-smart-city',
      author: new mongoose.Types.ObjectId(),
      status: 'approved',
      createdAt: now,
      updatedAt: now
    },
    {
      title: 'PKM Kemdikbud Batch Inspirasi 2026',
      description: 'Program kreativitas mahasiswa untuk riset dan kewirausahaan.',
      category: 'akademik',
      organizer: 'Direktorat Belmawa Kemdikbud',
      registrationDeadline: new Date(Date.now() + 90 * 24 * 3600 * 1000),
      eventDate: new Date(Date.now() + 120 * 24 * 3600 * 1000),
      prize: 'Pendanaan proposal hingga Rp10 juta',
      requirements: 'Mahasiswa aktif, tim 3-5 orang',
      registrationLink: 'https://campushub.local/pkm-2026',
      author: new mongoose.Types.ObjectId(),
      status: 'approved',
      createdAt: now,
      updatedAt: now
    }
  ];

  // Remove any previous test seeds with same titles (avoid duplicates)
  const titles = docs.map(d => d.title);
  await coll.deleteMany({ title: { $in: titles } });

  const result = await coll.insertMany(docs);
  console.log('Inserted competitions:', result.insertedCount);
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
