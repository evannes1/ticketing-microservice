import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async (done) => {
  //Create a ticket using the ticket model directly
  const ticket = Ticket.build({
    title: "concert1",
    price: 55,
    userId: "fred",
  });
  //Save to the database
  await ticket.save();

  // Fetch 2x
  const ticketVer1 = await Ticket.findById(ticket.id);
  const ticketVer2 = await Ticket.findById(ticket.id);
  // Update each ticket
  ticketVer1!.set({ price: 65 });
  ticketVer2!.set({ price: 75 });

  // Save first ticket
  await ticketVer1!.save();

  // Save 2nd; expect an error
  try {
    await ticketVer2!.save();
  } catch (err) {
    return done();
  }
  throw new Error("Should not see this");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "concert1",
    price: 55,
    userId: "fred",
  });
  //Save to the database
  await ticket.save();
  expect(ticket.version).toEqual(0);
  // Save again
  await ticket.save();
  expect(ticket.version).toEqual(1);
  // Save again
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
