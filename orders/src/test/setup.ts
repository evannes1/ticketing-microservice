import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { JsonWebTokenError } from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
    }
  }
}

jest.mock("../nats-wrapper");

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "asdf1111";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  const email = "test77@test.com";
  const password = "changeme";
  //console.log("IN global.signin()");

  // Build a JWT payload
  // generate a random user ID
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const payload = {
    id: ticketId,
    email: "test77@test.com",
  };

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  //console.log("Have created a token...");

  // Build session obj
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Encode JSON into base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // Return session cookie
  //console.log("Returning session cookie");
  return [`express:sess=${base64}`];
};
