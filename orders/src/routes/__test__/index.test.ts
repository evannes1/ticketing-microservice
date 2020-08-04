import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";

// Helper function
const buildTicket = async (title: string, ticketPrice: number) => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: title,
    price: ticketPrice,
  });
  await ticket.save();
  return ticket;
};

it("fetched orders for the given user", async () => {
  // Create 3 tickets; save to database
  const ticket1 = await buildTicket("concert1", 10);
  const ticket2 = await buildTicket("concert2", 11);
  const ticket3 = await buildTicket("concert3", 12);

  const user1 = global.signin();
  const user2 = global.signin();

  // Create 1 order as User #1
  await request(app)
    .post("/api/orders")
    .set("Cookie", user1)
    .send({ ticketId: ticket1.id })
    .expect(201);

  // Create 2 orders as User #2
  const { body: order1 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user2)
    .send({ ticketId: ticket2.id })
    .expect(201);

  const { body: order2 } = await request(app)
    .post("/api/orders")
    .set("Cookie", user2)
    .send({ ticketId: ticket3.id })
    .expect(201);

  // Make request to get list of orders for User #2
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", user2)
    .expect(200);

  console.log("order1: ", order1);
  // Expect only orders for User #2
  //console.log("Resp for user2: ", response.body);
  console.log("Resp body length: ", response.body.orders.length);
  expect(response.body.orders.length).toEqual(2);
  expect(response.body.orders[0].id).toEqual(order1.id);
  expect(response.body.orders[1].id).toEqual(order2.id);

  expect(response.body.orders[0].ticket.id).toEqual(ticket2.id);
  expect(response.body.orders[1].ticket.id).toEqual(ticket3.id);
});
