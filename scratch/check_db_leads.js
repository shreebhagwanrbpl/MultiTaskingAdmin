const { getDatabase } = require('./src/lib/mongodb');

async function check() {
  try {
    const db = await getDatabase();
    const leads = await db.collection('leads').find({}).sort({ createdAt: -1 }).limit(10).toArray();
    console.log('Recent 10 leads in MongoDB:');
    leads.forEach(l => {
      console.log({
        id: l.id,
        doctorName: l.doctorName,
        hospital: l.hospital,
        phone: l.phone,
        equipment: l.equipment,
        time: l.time,
        date: l.date,
        createdAt: l.createdAt
      });
    });
  } catch (err) {
    console.error('DB error:', err);
  } finally {
    process.exit(0);
  }
}

check();

