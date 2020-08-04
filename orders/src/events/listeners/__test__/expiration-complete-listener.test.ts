import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { OrderStatus, ExpirationCompleteEvent } from "@evstickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // create an instance of listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // Create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "Nick Cave II",
    price: 99,
  });
  // save
  await ticket.save();

  // build an order
  const order = Order.build({
    status: OrderStatus.Created,
    userId: "Frodo",
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, order, data, msg };
};

it("updates the order status to cancelled", async () => {
  const { ticket, listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);
  // find the order that was saved
  const update = await Order.findById(order.id);
  expect(update!.status).toEqual(OrderStatus.Cancelled);
});

it("emit an OrderCancelledEvent", async () => {
  const { ticket, listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it("acks the message", async () => {
  const { ticket, listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
