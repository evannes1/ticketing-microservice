import { Subjects } from "./subjects";

// This interface will couple ticket created events with
//  certain pieces of data, namely, id, title and price.  So if data
//  arrives on the TicketCreated channel, it should contain these 3 items.
export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
