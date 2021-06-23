import express from 'express';
import {json} from 'body-parser';

const app = express();
app.use(json());

app.get('/', (req, res) => {
  console.log(`zavanton - hello world`);
  res.send('hello world');
});

app.get('/api/users/currentuser', (req, res) => {
  console.log(`zavanton - current user`);
  res.send('Hi there');
});

app.listen(3000, () => {
  console.log(`zavanton - version 2`);
  console.log('Listening on port 3000');
});
