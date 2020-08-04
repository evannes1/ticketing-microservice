import { Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  // Name of the channel to which this publisher will post events
  abstract subject: T["subject"];

  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T["data"]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          // call reject
          return reject(err);
        }

        // Else, all is OK so resolve the promise
        console.log("Event published to subject: ", this.subject);
        resolve();
      });
    });
  }
}
