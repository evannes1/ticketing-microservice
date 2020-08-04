import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Blurb",
      price: 999,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "Blurb",
      price: 999,
    })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  // create a ticket
  const resp = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Science Guy",
      price: 27,
    });

  await request(app)
    .put(`/api/tickets/${resp.body.id}`)
    .set("Cookie", global.signin()) // will be a different user
    .send({
      title: "Blurb",
      price: 999,
    })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  //get a cookie
  const cookie = global.signin();
  // create a ticket
  const resp = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Science Guy",
      price: 27,
    });

  // try to update the ticket, using the ID returned in the create response
  await request(app)
    .put(`/api/tickets/${resp.body.id}`)
    .set("Cookie", cookie) // same user
    .send({
      title: "",
      price: 999,
    })
    .expect(400);

  // try to update the ticket, using the ID returned in the create response
  await request(app)
    .put(`/api/tickets/${resp.body.id}`)
    .set("Cookie", cookie) // same user
    .send({
      title: "Blurb",
      price: -10,
    })
    .expect(400);
});

it("updates the ticket with valid inputs", async () => {
  //get a cookie
  const cookie = global.signin();
  // create a ticket
  const resp = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Science Guy",
      price: 27,
    });

  // update the ticket, using the ID returned in the create response
  await request(app)
    .put(`/api/tickets/${resp.body.id}`)
    .set("Cookie", cookie) // same user
    .send({
      title: "Science Blurb",
      price: 35,
    })
    .expect(200);

  const ticketUpdate = await request(app)
    .get(`/api/tickets/${resp.body.id}`)
    .send();

  expect(ticketUpdate.body.title).toEqual("Science Blurb");
  expect(ticketUpdate.body.price).toEqual(35);
});

it("publishes an event", async () => {
  //get a cookie
  const cookie = global.signin();
  // create a ticket
  const resp = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Science Guy",
      price: 27,
    });
  // update the ticket just created, using the ID returned in the create response
  await request(app)
    .put(`/api/tickets/${resp.body.id}`)
    .set("Cookie", cookie) // same user
    .send({
      title: "Science Blurb",
      price: 35,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
  //get a cookie
  const cookie = global.signin();
  // create a ticket
  const resp = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Science Guy",
      price: 27,
    });

  // Get the ticket just created
  const ticket = await Ticket.findById(resp.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  // update the ticket just created, using the ID returned in the create response
  await request(app)
    .put(`/api/tickets/${resp.body.id}`)
    .set("Cookie", cookie) // same user
    .send({
      title: "Science Blurb",
      price: 35,
    })
    .expect(400);
});
