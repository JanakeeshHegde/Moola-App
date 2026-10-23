import http from 'http';
import { createApp } from './app';
import { connectDB, sanitizeMongoUri } from './config/database';
import { config } from './config/env';
import { initializeSocket } from './sockets/chat';

async function bootstrap(): Promise<void> {
  try {
    // ── Connect to MongoDB ────────────────────────────────────
    await connectDB();

    // ── Create Express app ────────────────────────────────────
    const app = createApp();

    // ── Create HTTP server ────────────────────────────────────
    const httpServer = http.createServer(app);

    // ── Initialize Socket.io ──────────────────────────────────
    const io = initializeSocket(httpServer);
    console.log('✅ Socket.io initialized');

    // Attach io to app for use in routes
    app.set('io', io);

    // ── Determine LAN IP for mobile development ───────────────
    const interfaces = (await import('os')).networkInterfaces();
    let lanIp = 'localhost';
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          lanIp = iface.address;
          break;
        }
      }
      if (lanIp !== 'localhost') break;
    }

    // ── Start listening ───────────────────────────────────────
    httpServer.listen(config.PORT, '0.0.0.0', () => {
      console.log('\n🌿 ═══════════════════════════════════════════');
      console.log(`🌿  MOOLA API Server`);
      console.log(`🌿  From the Source. To Your Home.`);
      console.log('🌿 ═══════════════════════════════════════════');
      console.log(`🚀  Local (Browser): http://localhost:${config.PORT}`);
      console.log(`📱  LAN (Mobile):    http://${lanIp}:${config.PORT}`);
      console.log(`🚀  Health:          http://localhost:${config.PORT}/api/health`);
      console.log(`🌍  Environment:     ${config.NODE_ENV}`);
      console.log('🌿 ═══════════════════════════════════════════\n');
    });

    // ── Graceful shutdown ─────────────────────────────────────
    const shutdown = async (signal: string) => {
      console.log(`\n⚡ ${signal} received, shutting down gracefully...`);
      httpServer.close(async () => {
        const { disconnectDB } = await import('./config/database');
        await disconnectDB();
        console.log('✅ Graceful shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      const msg = reason instanceof Error ? sanitizeMongoUri(reason.message) : sanitizeMongoUri(String(reason));
      console.error('Unhandled Promise Rejection:', msg);
    });

    process.on('uncaughtException', (err) => {
      const msg = err instanceof Error ? sanitizeMongoUri(err.message) : sanitizeMongoUri(String(err));
      console.error('Uncaught Exception:', msg);
      process.exit(1);
    });
  } catch (err) {
    const msg = err instanceof Error ? sanitizeMongoUri(err.message) : sanitizeMongoUri(String(err));
    console.error('❌ Failed to start server:', msg);
    process.exit(1);
  }
}

bootstrap();
