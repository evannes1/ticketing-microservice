import request from "supertest";
import { app } from "../../app";

const createTicket = (charge: number) => {
  return request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "Tech talk",
    price: charge,
  });
};

it("can fetch a list of tickets", async () => {
  await createTicket(15);
  await createTicket(20);
  await createTicket(25);

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(3);
});
