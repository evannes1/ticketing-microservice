import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, OrderStatus } from "@evstickets/common";
import mongoose from "mongoose";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // Create listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create/save a ticket using the Ticket model
  const ticket = Ticket.build({
    title: "Nick Cave",
    price: 88,
    userId: "Frodo",
  });
  await ticket.save();

  // Create a fake event
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "Frodo",
    expiresAt: "someFutureDate",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // Fake out a message
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  console.log("Order id created: ", data.id);
  return { listener, ticket, data, msg };
};

it("sets the orderID of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  // fetch the ticket that was updated by the listener when onMessage runs
  const update = await Ticket.findById(ticket.id);
  if (!update) {
    console.log("Could not locate ticket");
  }
  console.log("Have the updated ticket, ", update);
  expect(update!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket-updated event", async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketData.orderId);
});
