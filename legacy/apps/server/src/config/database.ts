import mongoose from 'mongoose';
import { config } from './env';

let isConnecting = false;
let listenersAttached = false;

/**
 * Strips user credentials (username and password) from any MongoDB URI or error string
 * to guarantee secrets never leak into logs or monitoring tools.
 */
export function sanitizeMongoUri(raw: string): string {
  if (!raw) return '';
  return raw.replace(/(mongodb(?:\+srv)?:\/\/)(?:[^\/\s]*@)/gi, '$1***:***@');
}

/**
 * Connect to MongoDB Atlas using the validated MONGODB_URI environment variable.
 * Must be awaited at server startup before accepting incoming HTTP requests.
 */
export async function connectDB(): Promise<void> {
  // If already fully connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Prevent concurrent connection attempts
  if (isConnecting) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (mongoose.connection.readyState === 1) {
          clearInterval(checkInterval);
          resolve();
        } else if (!isConnecting) {
          clearInterval(checkInterval);
          reject(new Error('Previous MongoDB connection attempt failed.'));
        }
      }, 100);
    });
  }

  isConnecting = true;
  mongoose.set('strictQuery', true);

  if (!listenersAttached) {
    mongoose.connection.on('error', (err) => {
      const errMsg = err instanceof Error ? sanitizeMongoUri(err.message) : sanitizeMongoUri(String(err));
      console.error('MongoDB connection error:', errMsg);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    listenersAttached = true;
  }

  try {
    const uri = config.MONGODB_URI;

    await mongoose.connect(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    });

    const host = mongoose.connection.host || 'remote-cluster';
    console.log(`✅ MongoDB Atlas connected successfully: ${sanitizeMongoUri(host)}`);
  } catch (error) {
    const safeMsg = error instanceof Error ? sanitizeMongoUri(error.message) : sanitizeMongoUri(String(error));
    console.error(`❌ Failed to connect to MongoDB: ${safeMsg}`);
    throw new Error(`MongoDB connection failed: ${safeMsg}`);
  } finally {
    isConnecting = false;
  }
}

/**
 * Gracefully disconnect from MongoDB (used during shutdown or test teardown)
 */
export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

/**
 * Returns the current database connection state without leaking credentials
 */
export function getDBStatus(): {
  connected: boolean;
  readyState: number;
  host?: string;
  name?: string;
} {
  const readyState = mongoose.connection.readyState;
  return {
    connected: readyState === 1,
    readyState,
    host: mongoose.connection.host ? sanitizeMongoUri(mongoose.connection.host) : undefined,
    name: mongoose.connection.name || undefined,
  };
}
