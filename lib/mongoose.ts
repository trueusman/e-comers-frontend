import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // No URI provided — run in demo mode. Return null so callers can handle gracefully.
  if (!MONGODB_URI) {
    // eslint-disable-next-line no-console
    console.warn("lib/mongoose: MONGODB_URI not set — skipping DB connect (demo mode)");
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => m)
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
