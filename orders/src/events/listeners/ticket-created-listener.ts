import { Message } from 'node-nats-streaming';
import { Listener, Subjects, TicketCreatedEvent } from '@zatickets/common';
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

// When a new ticket is created in tickets microservice,
// create a duplicate DB entry for this ticket in the orders microservice
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    // replicate data for tickets in the orders microservice
    const { id, title, price } = data;
    const ticket = Ticket.build({ id, title, price });
    await ticket.save();

    // send an ack which means that the event has been successfully processed
    msg.ack();
  }
}
