import request from "supertest";
import { app } from "../../app";

it("fails when an email that does not exist is supplied", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test-XX@test.com",
      password: "changeme",
    })
    .expect(400);
});

it("fails when an incorrect password is supplied", async () => {
  // first sign someone up
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test-XX@test.com",
      password: "changeme",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test-XX@test.com",
      password: "nope",
    })
    .expect(400);
});

it("responds with a cookie when given valid credentials", async () => {
  // first sign someone up
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test-XX@test.com",
      password: "changeme",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test-XX@test.com",
      password: "changeme",
    })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});
