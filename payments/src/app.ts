import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import {errorHandler, NotFoundError, currentUser} from '@zatickets/common';
import cookieSession from 'cookie-session';

const app = express();

// we need 'trust proxy' because we are using ingress-nginx
app.set('trust proxy', true);

app.use(json());
app.use(cookieSession({
  signed: false,
  // http is used for testing, https is used for production
  secure: process.env.NODE_ENV !== 'test'
}))

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

// global error handler for the auth microservice
app.use(errorHandler);

export {app};
