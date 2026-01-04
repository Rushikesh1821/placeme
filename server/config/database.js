/**
 * Database Configuration
 * 
 * @description MongoDB connection utilities and helpers
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

/**
 * Check if connection is ready
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get database stats
 */
const getDBStats = async () => {
  if (!isConnected()) {
    throw new Error('Database not connected');
  }

  const admin = mongoose.connection.db.admin();
  const serverInfo = await admin.serverInfo();
  const dbStats = await mongoose.connection.db.stats();

  return {
    version: serverInfo.version,
    uptime: serverInfo.uptime,
    connections: serverInfo.connections,
    database: {
      name: mongoose.connection.db.databaseName,
      collections: dbStats.collections,
      documents: dbStats.objects,
      dataSize: `${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      indexSize: `${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`
    }
  };
};

module.exports = {
  connectDB,
  disconnectDB,
  isConnected,
  getDBStats
};
