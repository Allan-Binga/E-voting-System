// const request = require('supertest');
// const app = require('../app'); // Adjust path if your Express app is elsewhere
// const mongoose = require('mongoose');

// describe('Auth Integration Tests', () => {
//     beforeAll(async () => {
//         // Connect to test database if needed
//         // await mongoose.connect(process.env.TEST_DB_URI);
//     });

//     afterAll(async () => {
//         // Clean up database and close connection
//         // await mongoose.connection.dropDatabase();
//         // await mongoose.connection.close();
//     });

//     describe('POST /api/auth/register', () => {
//         it('should register a new user', async () => {
//             const res = await request(app)
//                 .post('/api/auth/register')
//                 .send({
//                     username: 'testuser',
//                     email: 'testuser@example.com',
//                     password: 'TestPass123!'
//                 });
//             expect(res.statusCode).toBe(201);
//             expect(res.body).toHaveProperty('token');
//             expect(res.body).toHaveProperty('user');
//             expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
//         });

//         it('should not register with existing email', async () => {
//             await request(app)
//                 .post('/api/auth/register')
//                 .send({
//                     username: 'testuser2',
//                     email: 'testuser@example.com',
//                     password: 'TestPass123!'
//                 });
//             const res = await request(app)
//                 .post('/api/auth/register')
//                 .send({
//                     username: 'testuser3',
//                     email: 'testuser@example.com',
//                     password: 'TestPass123!'
//                 });
//             expect(res.statusCode).toBe(400);
//         });
//     });

//     describe('POST /api/auth/login', () => {
//         it('should login with correct credentials', async () => {
//             const res = await request(app)
//                 .post('/api/auth/login')
//                 .send({
//                     email: 'testuser@example.com',
//                     password: 'TestPass123!'
//                 });
//             expect(res.statusCode).toBe(200);
//             expect(res.body).toHaveProperty('token');
//             expect(res.body).toHaveProperty('user');
//         });

//         it('should not login with incorrect password', async () => {
//             const res = await request(app)
//                 .post('/api/auth/login')
//                 .send({
//                     email: 'testuser@example.com',
//                     password: 'WrongPass!'
//                 });
//             expect(res.statusCode).toBe(401);
//         });

//         it('should not login with non-existent email', async () => {
//             const res = await request(app)
//                 .post('/api/auth/login')
//                 .send({
//                     email: 'nonexistent@example.com',
//                     password: 'TestPass123!'
//                 });
//             expect(res.statusCode).toBe(401);
//         });
//     });
// });