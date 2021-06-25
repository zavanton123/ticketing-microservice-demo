import mongoose from 'mongoose';
import {app} from "./app";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT key must be defined');
  }

  try {
    await mongoose.connect(`mongodb://auth-mongo-srv:27017/auth`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log(`zavanton - connected to DB`);
  } catch (err) {
    console.error(`zavanton - error connecting to DB: ${err}`);
  }
  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
}

start();
