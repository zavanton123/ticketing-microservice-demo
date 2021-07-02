import {Order} from "../../../models/order";
import mongoose from 'mongoose';
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../../../../../tickets/src/events/listeners/order-cancelled-listener";
import { OrderCreatedEvent, OrderStatus } from "@zatickets/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'afdklsaj',
    userId: "123",
    status: OrderStatus.Created,
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
      price: 10
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return {listener, data, msg};
};

it('replicates the order info', async () => {
  const {listener, data, msg} = await setup();
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const {listener, data, msg} = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
