import request from 'supertest';
import { app } from '../../app';

it('responds with details about the current user', async () => {
  // signin and get the cookie with JWT
  const cookie = await global.signin();

  const response = await request(app)
    .get('/api/users/currentuser')
    // Note: we have to set the cookie to the request manually
    // in prod the browser is doing this for us
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
