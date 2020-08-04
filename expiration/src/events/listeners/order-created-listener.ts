import { Listener, OrderCreatedEvent, Subjects } from "@evstickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // need to delay for 15 minutes before sending expiration

    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log("Expiration interval in milliseconds: ", delay);
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: delay, //delay in milliseconds
      }
    );
    // ack
    msg.ack();
  }
}
