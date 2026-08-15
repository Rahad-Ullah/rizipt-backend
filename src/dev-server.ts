import colors from 'colors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import config from './config';
import { seedSuperAdmin } from './DB/seedAdmin';
import { socketHelper } from './helpers/socketHelper';
import { errorLogger, logger } from './shared/logger';
import { initAppQueuesAndWorkers } from './app/queue';
import process from 'process';

//uncaught exception
process.on('uncaughtException', error => {
  errorLogger.error('UnhandleException Detected', error);
  process.exit(1);
});

let server: any;
let queueHandlers: any;

// Centralized graceful shutdown helper
const handleGracefulShutdown = async (signal: string) => {
  logger.info(
    colors.yellow(`\n${signal} received. Starting graceful shutdown...`),
  );

  try {
    // 1. Close BullMQ workers (releases Redis locks immediately)
    if (queueHandlers) {
      await queueHandlers.closeWorkers();
    }

    // 2. Close HTTP & Socket server
    if (server) {
      await new Promise<void>(resolve => {
        server.close(() => {
          logger.info('HTTP & WebSocket server closed.');
          resolve();
        });
      });
    }

    // 3. Close MongoDB connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');

    process.exit(0);
  } catch (err) {
    errorLogger.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
};

// Start the server
async function main() {
  logger.info(colors.yellow('🚀 Server is starting...'));
  try {
    mongoose.connect(config.database_url as string);
    logger.info(colors.green('✅ Database connected successfully'));

    //Seed Super Admin after database connection is successful
    await seedSuperAdmin();

    const port =
      typeof config.port_dev === 'number'
        ? config.port_dev
        : Number(config.port_dev);

    server = app.listen(port, config.ip_address as string, () => {
      logger.info(colors.yellow(`📶 Application listening on port:${port}`));
    });

    //socket
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });
    socketHelper.socket(io);
    //@ts-ignore
    global.io = io;

    // Initialize bullMQ background jobs
    queueHandlers = await initAppQueuesAndWorkers();
  } catch (error) {
    console.error(error);
    errorLogger.error(colors.red('🤢 Failed to connect Database'));
  }

  //handle unhandleRejection
  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorLogger.error('UnhandleRejection Detected', error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();

// Process signal listeners for dev restarts / deployments
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
