const request = require('supertest');
const app = require('./main');

describe('Express App', () => {
  it('should handle a successful login', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'admin' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should handle a failed login with incorrect credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'invaliduser', password: 'invalidpassword' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
  });

  it('should create a new account successfully', async () => {
    const response = await request(app)
      .post('/createAccount')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        username: 'newuser',
        password: 'newpassword',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should handle a failed account creation with existing username', async () => {
    const response = await request(app)
      .post('/createAccount')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        username: 'admin', 
        password: 'newpassword',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Username already exists.');
  });
});
