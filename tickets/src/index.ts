import mongoose from 'mongoose';
import {app} from "./app";
import {natsWrapper} from "./nats-wrapper";

const start = async () => {
  // check if the environment variables are set
  if (!process.env.JWT_KEY) {
    throw new Error('JWT key must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    // connect to the NATS event bus
    await natsWrapper.connect(
      'ticketing',
      'some-client-id-here',
      'http://nats-srv:4222'
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

    // note: use the mongodb pod's cluster ip address: tickets-mongo-srv
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log(`zavanton - connected to DB`);
  } catch (err) {
    console.error(`zavanton - error connecting to DB: ${err}`);
  }
  app.listen(3000, () => {
    console.log('tickets - Listening on port 3000');
  });
}

start();