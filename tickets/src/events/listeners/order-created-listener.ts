import { Ticket } from "../../models/ticket";
import { Listener, OrderCreatedEvent, Subjects } from '@zatickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from "./queue-group-name";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

// When an order is created, the ticket in this orders becomes reserved
// (i.e. other users cannot buy it)
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // if no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket is not found');
    }

    // mark the ticket as reserved by setting its orderId property
    ticket.set({ orderId: data.id });

    // save the ticket
    await ticket.save();

    // the ticket is updated, so we must send a ticket:updated event
    // note: we are adding 'await' here, so that we first publish the event,
    // and only after it succeeds or fails to publish we actually send the ack
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version
    });

    // the event is processed, so we are sending an ack
    msg.ack();
  }
}
