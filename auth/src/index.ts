import mongoose from 'mongoose';
import {app} from "./app";

const start = async () => {
  // check if the environment variables are set
  console.log(`zavanton - starting auth service...`);
  if (!process.env.JWT_KEY) {
    throw new Error('JWT key must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  try {
    // note: use the mongodb pod's cluster ip address: auth-mongo-srv
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
    console.log('auth - Listening on port 3000');
  });
}

start();
