import { Message } from 'node-nats-streaming';
import { Listener, Subjects, TicketUpdatedEvent } from '@zatickets/common';
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

// When a ticket is updated in tickets microservice,
// update the respective duplicate DB entry for this ticket in the orders microservice
export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    // this is optimistic concurrency control
    // (find by the specific id and version)
    // if the version is incorrect, the event is rejected
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // update the ticket
    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();

    // send an ack which means that the event has been successfully processed
    msg.ack();
  }
}
