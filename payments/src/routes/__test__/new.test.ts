import { Order } from "../../models/order";
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from "../../app";
import { OrderStatus } from "@zatickets/common";
import { signin } from "../../test/setup";

jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      token: 'some-token',
      orderId: mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      token: 'some-token',
      orderId: order.id
    })
    .expect(401);
});

it('returns 400 when purchasing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      orderId: order.id,
      token: 'falskj',
    })
    .expect(400);
});

// it('returns a 201 with valid inputs', async () => {
//   const userId = mongoose.Types.ObjectId().toHexString();
//   const order = Order.build({
//     id: mongoose.Types.ObjectId().toHexString(),
//     userId,
//     version: 0,
//     price: 20,
//     status: OrderStatus.Created
//   });
//   await order.save();
//
//   await request(app)
//     .post('/api/payments')
//     .set('Cookie', signin(userId))
//     .send({
//       orderId: order.id,
//       // this is a test token taken from stripe docs
//       token: 'tok_visa',
//     })
//     .expect(201);
//
//
//   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//   expect(chargeOptions.source).toEqual('tok_visa');
//   expect(chargeOptions.amount).toEqual(20 * 100);
//   expect(chargeOptions.currency).toEqual('usd');
//
//   // todo zavanton - for the test to work correctly,
//   // we have to mock the result of calling stripe API (i.e. stripeId)
// });
