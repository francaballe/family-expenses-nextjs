import mongoose from 'mongoose';

const { DB_USER, DB_PASSWORD } = process.env;

if (!DB_USER || !DB_PASSWORD) {
  throw new Error(
    'Please define the DB_USER and DB_PASSWORD environment variables'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.tv053jn.mongodb.net`, opts).then((mongoose) => {
      console.log('Successful connection to the Database');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
