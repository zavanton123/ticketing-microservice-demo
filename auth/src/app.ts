import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";
import { signoutRouter } from "./routes/signout";
import { errorHandler, NotFoundError } from '@zatickets/common';
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

// Use routers
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// Generic router for all other paths
app.all('*', async (req, res) => {
  throw new NotFoundError();
});

// global error handler for the auth microservice
app.use(errorHandler);

export { app };
