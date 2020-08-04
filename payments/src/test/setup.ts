import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";

import { JsonWebTokenError } from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}

jest.mock("../nats-wrapper");

let mongo: any;

process.env.STRIPE_KEY =
  "sk_test_51H8yEzJcm70biFEZSJ5enILFGR9dFNqGK735zEbM0FlgZdqWeOMR2FUA2733gRX5WL3AEamDmGip7vdbUaAcRJX400pYWDTbM4";

beforeAll(async () => {
  process.env.JWT_KEY = "asdf1111";

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
});

global.signin = (id?: string) => {
  const email = "test77@test.com";
  const password = "changeme";

  // Build a JWT payload
  // generate a random user ID
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const payload = {
    id: id || ticketId,
    email: "test77@test.com",
  };

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session obj
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Encode JSON into base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // Return session cookie
  return [`express:sess=${base64}`];
};
