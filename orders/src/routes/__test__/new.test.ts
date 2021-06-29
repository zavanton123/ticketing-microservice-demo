import request from 'supertest';
import mongoose from 'mongoose';
import {app} from '../../app';
import {Order, OrderStatus} from '../../models/order';
import {Ticket} from "../../models/ticket";


it('returns an error if the ticket does not exist', async () => {
  const ticketId = mongoose.Types.ObjectId();
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ticketId})
    .expect(404);
});

it('returns an error if the ticket if already reserved', async () => {
  // save a ticker
  const ticket = Ticket.build({
    title: 'concert',
    price: 20
  });
  await ticket.save();

  // save an order
  const order = Order.build({
    ticket,
    userId: 'fslajfaskl',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });
  await order.save();

  // attempt to create order
  await request(app)
    .post('/api/orders/')
    .set('Cookie', global.signin())
    .send({ticketId: ticket.id})
    .expect(400);
});

it('reserves a ticket', async () => {

});
