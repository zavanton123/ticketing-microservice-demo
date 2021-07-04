import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from "../app";
import request from 'supertest';

// global signin function is just for convenience
// (i.e. avoid importing)
// (exported non-global function would also be ok)
declare global {
  namespace NodeJS {
    interface Global {
      signin(): Promise<string[]>;
    }
  }
}

// for testing we are using mongodb in memory
// open db connection at the start of the tests
let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = "test_jwt_key";

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// clear all collections after each individual test
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// close db connection at the finish of the tests
afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// This function is used to mock authorization in tests
global.signin = async () => {
  const email = 'test@test.com';
  const password = 'password';

  // do the signin
  const response = await request(app)
    .post('/api/users/signup')
    .send({ email, password })
    .expect(201);

  // return the cookie
  return response.get('Set-Cookie');
};
