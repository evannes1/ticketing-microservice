import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("returns a 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  console.log("IN test for success...");
  const title = "A concert event";
  const price = 19;

  const resp = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  // get id from response
  console.log("Back from creating ticket....");
  //console.log("Total resp: ", resp);

  console.log("Ticket resp body: ", resp.body);
  const ticketResp = await request(app)
    .get(`/api/tickets/${resp.body.id}`)
    .send()
    .expect(200);

  console.log("Have fetched ticket ", ticketResp.body.title);
  expect(ticketResp.body.title).toEqual(title);
  expect(ticketResp.body.price).toEqual(price);
});
