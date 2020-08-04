import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("fetches the order for the user", async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert1",
    price: 10,
  });
  await ticket.save();

  const user = global.signin();
  // Make a request to build the order with the ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Then fetch the order
  const { body: fetchOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  console.log("Fetched order: ", fetchOrder);

  expect(fetchOrder.order.id).toEqual(order.id);
});

it("returns an error if unauthorized user tries to fetch order", async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert2",
    price: 22,
  });
  await ticket.save();

  const user = global.signin();
  // Make a request to build the order with the ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const unauthUser = global.signin();
  // Then fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", unauthUser)
    .send()
    .expect(401);
});
