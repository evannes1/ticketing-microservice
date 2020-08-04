import Queue from "bull";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";
import { natsWrapper } from "../nats-wrapper";

// Data for job object sent over queue to redis
interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

// Job is a wrapper for the data
expirationQueue.process(async (job) => {
  const pub = new ExpirationCompletePublisher(natsWrapper.client);
  pub.publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
