import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent } from '@zatickets/common';
import { Ticket } from "../../../models/ticket";
// a mock natsWrapper is imported here
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create and save a ticket (with an existing orderId)
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: '123'
  });
  const orderId = mongoose.Types.ObjectId().toHexString();
  ticket.set({ orderId });
  await ticket.save();

  // create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    }
  }

  // Created a message mock
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { msg, data, ticket, orderId, listener };
};

it('updates the ticket, publishes the event and acks the message', async () => {
  const { msg, data, ticket, orderId, listener } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
