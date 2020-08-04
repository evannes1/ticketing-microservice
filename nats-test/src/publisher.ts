import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();
// Create a NATS client; by convention, the object name is 'stan' (nats in reverse)
//  Client id is 'abc'
const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

// Wait for connect event to be emitted
stan.on("connect", async () => {
  console.log("Publisher connected to NATS");

  const publisher = new TicketCreatedPublisher(stan);

  try {
    await publisher.publish({
      id: "123",
      title: "some concert",
      price: 22,
    });
  } catch (err) {
    console.error(err);
  }

  // need to serialize to json
  // const data = JSON.stringify({
  //  id: "123",
  //  title: "some concert",
  //  price: 20,
  // });

  //stan.publish("ticket:created", data, () => {
  //  console.log("Event published!");
  //});
});
