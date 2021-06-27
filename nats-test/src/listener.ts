import nats from 'node-nats-streaming';

// this is to remove the previous output in the console
console.clear();

const stan = nats.connect('ticketing', '123', {
  url: 'http://localhost:4222'
});

stan.on('connect', () => {
  console.log(`zavanton - listener is connected to NATS`);

  const subscription = stan.subscribe('ticket:created');
  subscription.on('message', (msg) => {
    console.log(`zavanton - message received`);
  });
});
