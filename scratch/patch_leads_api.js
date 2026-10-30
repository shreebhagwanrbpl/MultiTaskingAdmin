const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/api/leads/route.js');
let content = fs.readFileSync(filePath, 'utf8');

const oldPutPattern = /export async function PUT\(request\) \{[\s\S]*?return NextResponse\.json\(\{ success: false, error: err\.message \}, \{ status: 500, headers: CORS_HEADERS \}\);\s*\}\s*\}/;

const newPutCode = `export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, _id, ...fieldsToUpdate } = body;

    const currentList = readLocalLeads();
    const foundIdx = currentList.findIndex(l => (id && l.id === id) || (_id && (l._id === _id || String(l._id) === String(_id))));
    if (foundIdx >= 0) {
      currentList[foundIdx] = {
        ...currentList[foundIdx],
        ...fieldsToUpdate,
        updatedAt: new Date().toISOString()
      };
      writeLocalLeads(currentList);
    }

    try {
      const db = await getDatabase();
      const collection = db.collection('leads');
      const query = id ? { id } : {};
      if (_id && !id) {
        try {
          const { ObjectId } = await import('mongodb');
          query._id = new ObjectId(_id);
        } catch (e) {
          query._id = _id;
        }
      }
      await collection.updateOne(query, {
        $set: {
          ...fieldsToUpdate,
          updatedAt: new Date().toISOString()
        }
      });
      return NextResponse.json({
        success: true,
        updated: true,
        source: 'mongodb',
        lead: foundIdx >= 0 ? currentList[foundIdx] : null
      }, { headers: CORS_HEADERS });
    } catch (dbErr) {
      return NextResponse.json({
        success: true,
        updated: true,
        source: 'fallback',
        lead: foundIdx >= 0 ? currentList[foundIdx] : null
      }, { headers: CORS_HEADERS });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}`;

if (oldPutPattern.test(content)) {
  content = content.replace(oldPutPattern, newPutCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated PUT method in /api/leads/route.js');
} else {
  console.error('Could not match PUT in /api/leads/route.js');
  process.exit(1);
}

