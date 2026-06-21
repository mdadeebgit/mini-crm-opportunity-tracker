import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the connection string in MONGO_URI.
 * Exits the process on failure so the app does not run without a database.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('Missing MONGO_URI environment variable.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
