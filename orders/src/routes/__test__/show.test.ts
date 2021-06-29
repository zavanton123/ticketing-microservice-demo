import request from 'supertest';
import {app} from '../../app';
import {Ticket} from "../../models/ticket";

it('fetches the order', async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20
  });
  await ticket.save();

  // login
  const user = global.signin();

  // make a request to build an order
  const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ticketId: ticket.id})
    .expect(201);

  // make a request to fetch the order
  const {body: fetchedOrder} = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another user order', async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20
  });
  await ticket.save();

  // login
  const userOne = global.signin();
  const userTwo = global.signin();

  // make a request to build an order (as user #1)
  const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ticketId: ticket.id})
    .expect(201);

  // make a request to fetch the order (as user #2)
  const {body: fetchedOrder} = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userTwo  )
    .send()
    .expect(401);
});
