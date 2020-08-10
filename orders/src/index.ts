import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";

// connect to mongo db via the auth-mongo-srv defined in auth-mongo-depl file.
//  Use the standard port and give it a name for DB that will be created, here "auth".
const start = async () => {
  console.log("Starting orders service again...");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    // Graceful shutdown
    natsWrapper.client.on("close", () => {
      console.log("In listener, NATS connection closed");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    const ticketCreatedListener = new TicketCreatedListener(natsWrapper.client);
    ticketCreatedListener.listen();
    const ticketUpdatedListener = new TicketUpdatedListener(natsWrapper.client);
    ticketUpdatedListener.listen();

    const expirationCompleteListener = new ExpirationCompleteListener(
      natsWrapper.client
    );
    expirationCompleteListener.listen();

    const paymentCreatedListener = new PaymentCreatedListener(
      natsWrapper.client
    );
    paymentCreatedListener.listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Tickets -- Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log("Listening on port 3000!!!!");
  });
};

start();
