import mongoose from "mongoose";
//import {Message } from 'nodes-nats-streaming';
import { TicketUpdatedEvent } from "@evstickets/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create an instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "Nick Cave II",
    price: 99,
  });
  // save
  await ticket.save();

  //  create a fake data update event (data is of type TicketUpdatedEvent, the data property)
  const data: TicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: "Nick Cave III",
    price: 55,
    userId: "BooBob",
  };
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg };
};

it("finds, updates, and saves a ticket", async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  // Locate the ticket that was updated/saved
  const update = await Ticket.findById(ticket.id);
  expect(update!.title).toEqual(data.title);
  expect(update!.price).toEqual(data.price);
  expect(update!.version).toEqual(data.version);
});

it("acks a message", async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has the wrong (future) version", async () => {
  const { msg, data, ticket, listener } = await setup();

  data.version = 15;

  try {
    listener.onMessage(data, msg);
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
});
