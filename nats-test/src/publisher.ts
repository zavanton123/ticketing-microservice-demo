import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

// this is to remove the previous output in the console
console.clear();

// setup the connection
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222'
});

// do when the connection is OK
stan.on('connect', async () => {
  console.log(`zavanton - publisher is connected to NATS`);

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '123',
      title: 'concert',
      price: 20
    });
  } catch (err) {
    console.error(err);
  }

  // create a json of some complex data object
  const data = JSON.stringify({
    id: '123',
    title: 'concert',
    price: 20
  });

  // publish the json to some channel
  stan.publish('ticket:created', data, () => {
    console.log(`zavanton - event is published`);
  });
});
