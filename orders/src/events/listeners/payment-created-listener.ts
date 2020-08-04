import { Message } from "node-nats-streaming";
import {
  Listener,
  Subjects,
  PaymentCreatedEvent,
  OrderStatus,
} from "@evstickets/common";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error("IN PaymentCreatedListener, order not found");
    }
    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    msg.ack();
  }
}
