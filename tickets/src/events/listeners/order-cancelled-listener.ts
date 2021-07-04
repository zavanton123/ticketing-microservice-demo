import { Listener, OrderCancelledEvent, Subjects } from '@zatickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

// When the order is cancelled, the ticket in the order should be made unreserved
// (i.e. available for other users to purchase)
export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName: string = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // the order is cancelled, so we make the ticket.orderId to be null
    ticket.set({ orderId: undefined });
    await ticket.save();

    // ticket is updated, so we publish the ticket:updated event
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
