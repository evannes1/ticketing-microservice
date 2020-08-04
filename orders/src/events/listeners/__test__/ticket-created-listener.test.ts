import mongoose from "mongoose";
import { TicketCreatedEvent } from "@evstickets/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create an instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  //  create a fake data event (data is of type TicketCreatedEvent, the data property)
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Nick Cave",
    price: 55,
    userId: "BooBob",
  };
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function
  await listener.onMessage(data, msg);
  // Locate the ticket that was created by the order service
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  // write assertions
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function
  await listener.onMessage(data, msg);
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
