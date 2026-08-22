import mongoose from "mongoose";

let isConnected = false;
let connectionError = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === "" || uri.includes("<username>")) {
    console.log("ℹ️  [MongoDB] No MONGODB_URI provided in .env. Running with in-memory resilient data store.");
    return false;
  }

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });

    isConnected = true;
    connectionError = null;
    console.log("✅ [MongoDB] Successfully connected to persistent database:", mongoose.connection.name || "equitable_ai");

    mongoose.connection.on("error", (err) => {
      console.error("❌ [MongoDB] Runtime connection error:", err.message);
      isConnected = false;
      connectionError = err.message;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  [MongoDB] Disconnected from database. Reconnecting...");
      isConnected = false;
    });

    return true;
  } catch (error) {
    isConnected = false;
    connectionError = error.message;
    console.warn(`⚠️  [MongoDB] Connection attempt failed (${error.message}). Running with resilient in-memory fallback.`);
    return false;
  }
}

export function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export function getMongoStatus() {
  return {
    connected: isMongoConnected(),
    readyState: mongoose.connection.readyState,
    databaseName: mongoose.connection.name || null,
    error: connectionError
  };
}
