import request from 'supertest';
import {app} from '../../app';
import {Ticket} from "../../models/ticket";
// note: a mock is imported here (not the real natsWrapper)
import {natsWrapper} from "../../nats-wrapper";

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});
  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  // the same as: expect(response.status).toEqual(401);
  await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401);
});

it('return a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({})
  expect(response.status).not.toEqual(401);
});

it('returns and error if invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 10
    })
    .expect(400);
});

it('returns an error if invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'valid-title',
      price: -10
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'valid-title'
    })
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  const expTitle = 'valid-title';

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: expTitle,
      price: 10
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(expTitle);
  expect(tickets[0].price).toEqual(10);
});

it('publishes an event', async () => {
  const title = 'valid-title';
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: title,
      price: 10
    })
    .expect(201);

  console.log(`zavanton - natsWrapper`);
  console.log(natsWrapper);

  // test if the mocked function has been called
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
