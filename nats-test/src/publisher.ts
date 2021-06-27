import nats from 'node-nats-streaming';

// this is to remove the previous output in the console
console.clear();

// setup the connection
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222'
});

// do when the connetion is OK
stan.on('connect', () => {
  console.log(`zavanton - publisher is connected to NATS`);

  // create a json of some complex data object
  const data = JSON.stringify({
    id: '123',
    title: 'concert',
    price: 20
  });

  // publish the json to some channel
  stan.publish('ticket:created', data, ()=> {
    console.log(`zavanton - event is published`);
  });
});
