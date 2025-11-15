/**
 * Database setup and indexes
 * Creates necessary indexes for optimal query performance
 */

async function setupIndexes(db) {
  try {
    // Index for readings collection - optimize history queries
    const readings = db.collection('readings');
    await readings.createIndex({ device_id: 1, ts: -1 });
    await readings.createIndex({ created_at: 1 }); // For retention cleanup
    console.log('✅ Database indexes created');
    
    return true;
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    return false;
  }
}

module.exports = { setupIndexes };
