import mongoose from 'mongoose';
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";

const start = async () => {
  // check if the environment variables are set
  console.log(`zavanton - starting tickets...`);
  if (!process.env.JWT_KEY) {
    throw new Error('JWT key must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
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
      // ticketing
      process.env.NATS_CLUSTER_ID,
      // tickets
      process.env.NATS_CLIENT_ID,
      // http://nats-srv:4222
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

    // Listen for order created/cancelled events
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    // note: use the mongodb pod's cluster ip address: tickets-mongo-srv
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log(`zavanton - connected to DB`);
  } catch (err) {
    console.error(`zavanton - error connecting to DB: ${ err }`);
  }
  app.listen(3000, () => {
    console.log('tickets - Listening on port 3000');
  });
}

start();