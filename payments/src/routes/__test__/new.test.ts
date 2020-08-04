import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { stripe } from "../../stripe";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import { OrderStatus } from "@evstickets/common";

//jest.mock("../../stripe");

it("returns a 404 when purchasing an order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "the token",
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns a 401 when attempting to purchase an order that the user does not own", async () => {
  // Build an order
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 99,
    status: OrderStatus.Created,
  });
  await order.save();

  // Now try to pay for it....
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "the token",
      orderId: order.id,
    })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  // Build an order
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 0,
    price: 99,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  // Try to purchase
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "the token",
      orderId: order.id,
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const testPrice = Math.floor(Math.random() * 100000);
  // Build an order
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 0,
    price: testPrice,
    status: OrderStatus.Created,
  });
  await order.save();

  // Try to purchase
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  // Fetch list of charges from stripe
  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === testPrice * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual("usd");

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });
  expect(payment).not.toBeNull();

  //const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  //expect(chargeOptions.source).toEqual("tok_visa");
  //expect(chargeOptions.amount).toEqual(99 * 100);
  //expect(chargeOptions.currency).toEqual("usd");
});
