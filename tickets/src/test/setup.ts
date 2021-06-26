import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// global signin function is just for convenience
// (i.e. avoid importing)
// (exported non-global function would also be ok)
declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
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

global.signin = () => {
  // build a JWT payload {id, email}
  const payload = {
    id: 'this-is-some-id',
    email: 'test@test.com'
  };

  // create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session object: {jwt: my-jwt-here}
  const session = {jwt: token};

  // turn that session into json
  const sessionJSON = JSON.stringify(session);

  // take the json and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string (i.e. with encoded data)
  return [`express:sess=${base64}`];
};
