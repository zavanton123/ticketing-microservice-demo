import { natsWrapper } from "./nats-wrapper";

const start = async () => {
  // check if the environment variables are set
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  try {
    // connect to the NATS event bus
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    // shut down the entire application
    // when the NATS is disconnected
    natsWrapper.client.on('close', () => {
      console.log(`zavanton - NATS connection closed`);
      process.exit();
    });
    // disconnect NATS when the application is closed
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());
  } catch (err) {
    console.error(`zavanton - error connecting to DB: ${err}`);
  }
}

start();