import { getDatabase } from '../src/lib/mongodb.js';

async function check() {
  try {
    const db = await getDatabase();
    const leads = await db.collection('leads').find({
      $or: [
        { phone: { $regex: '8569874859' } },
        { customerPhone: { $regex: '8569874859' } },
        { 'rawLeadData.customerPhone': { $regex: '8569874859' } }
      ]
    }).toArray();
    console.log(`Found ${leads.length} leads in MongoDB for 8569874859:`);
    leads.forEach(l => {
      console.log({
        _id: String(l._id),
        id: l.id,
        equipment: l.equipment,
        time: l.time,
        date: l.date,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
        hospital: l.hospital
      });
    });
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
check();

