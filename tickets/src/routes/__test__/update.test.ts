import { Ticket } from "../../models/ticket";
import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
// note: a mock is imported here (not the real natsWrapper)
import { natsWrapper } from "../../nats-wrapper";

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'some-valid-title',
      price: 20
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'some-valid-title',
      price: 20
    })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    // note: this is user #1
    .set('Cookie', global.signin())
    .send({
      title: 'some-valid-title',
      price: 20
    })
    .expect(201);

  await request(app)
    // note: we are updating the ticket we have just created
    .put(`/api/tickets/${response.body.id}`)
    // note: this is user #2
    .set('Cookie', global.signin())
    .send({
      title: 'some-valid-title-2',
      price: 40
    })
    .expect(401);
});

it('returns a 400 if the users provides invalid title or price', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    // note: the same user
    .set('Cookie', cookie)
    .send({
      title: 'some-valid-title',
      price: 20
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    // note: the same user
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 40
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    // note: the same user
    .set('Cookie', cookie)
    .send({
      title: 'valid-title-2',
      price: -40
    })
    .expect(400);
});

it('updates the ticket when valid inputs are provided', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    // note: the same user
    .set('Cookie', cookie)
    .send({
      title: 'some-valid-title',
      price: 20
    })
    .expect(201);

  const newTitle = 'some-new-title';
  const newPrice = 150;

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    // note: the same user
    .set('Cookie', cookie)
    .send({
      title: newTitle,
      price: newPrice
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual(newTitle);
  expect(ticketResponse.body.price).toEqual(newPrice);
});

it('publishes an event', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    // note: the same user
    .set('Cookie', cookie)
    .send({
      title: 'some-valid-title',
      price: 20
    })
    .expect(201);

  const newTitle = 'some-new-title';
  const newPrice = 150;

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    // note: the same user
    .set('Cookie', cookie)
    .send({
      title: newTitle,
      price: newPrice
    })
    .expect(200);

  // test if the mocked function has been called
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'some-valid-title',
      price: 20
    })
    .expect(201);

  // Make the ticket reserved
  // (i.e. it should have an orderId)
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  const newTitle = 'some-new-title';
  const newPrice = 150;

  // the reserved ticket update should be rejected (i.e. http code == 400)
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: newTitle,
      price: newPrice
    })
    .expect(400);
});
