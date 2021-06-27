import nats, {Message} from 'node-nats-streaming';
import {randomBytes} from 'crypto';

// this is to remove the previous output in the console
console.clear();

// each client must have a unique id, so
// we are generating a random id
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
});

stan.on('connect', () => {
  console.log(`zavanton - listener is connected to NATS`);

  // this helps to prevent NATS from waiting for a client
  // from a killed process
  stan.on('close', () => {
    console.log(`zavanton - NATS connection closed`);
    process.exit();
  });

  // acks should be sent back manually
  const options = stan.subscriptionOptions()
    .setManualAckMode(true);

  // subscribe to some channel
  // and be a part of some queue group
  const subscription = stan.subscribe(
    'ticket:created',
    'orders-service-queue-group',
    options
  );

  // listen for messages and process them
  subscription.on('message', (msg: Message) => {
    const data = msg.getData();
    if (typeof data === 'string') {
      console.log(`Received event number: ${msg.getSequence()} with data: ${data}`);
    }

    // send back the ack manually
    // when the message is processed successfully
    msg.ack();
  });
});

// close the NATS client before killing the process
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
