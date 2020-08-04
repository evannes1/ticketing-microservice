import { Listener, OrderCreatedEvent, Subjects } from "@evstickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // Find the ticket referenced in the order
    const ticket = await Ticket.findById(data.ticket.id);
    // if no ticket, throw error
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    // Mark the ticket as reserved: set order id property
    ticket.set({ orderId: data.id });
    // console.log("IN onMessage, setting orderId to: ", data.id);
    // save
    await ticket.save();
    //  console.log("After save, orderID: ", ticket.orderId);

    // Publish event
    const pub = new TicketUpdatedPublisher(this.client);
    await pub.publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });
    // ack
    msg.ack();
  }
}
