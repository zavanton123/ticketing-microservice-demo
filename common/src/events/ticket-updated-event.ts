import {Subjects} from "./subjects";

export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated;
  data: {
    id: string;
    version: number;
    title: string;
    price: number;
    userId: string;
    // the id of the order which is reserving this ticket
    orderId?: string;
  };
}
