const request = require('supertest')
const express = require('express');

const app = require('../../app');

const {MongoClient} = require('mongodb');
const config = require('../config/config');

describe('insert', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(config.SLACKBOT_URI, {
      useNewUrlParser: true,
    });
    db = await connection.db(config.SLACKBOT_NS);
  });

  afterAll(async () => {
    await connection.close();
    await db.close();
  });

  it('should insert a doc into collection', async () => {
    const users = db.collection('users');

    const mockUser = {_id: 'some-user-id', name: 'John'};
    await users.insertOne(mockUser);

    const insertedUser = await users.findOne({_id: 'some-user-id'});
    expect(insertedUser).toEqual(mockUser);
  });
});


// describe('get user appointments', () => {
//   it('should retrieve the user appointments', async () => {
//     const res = await request(app).get('slackbot/query/U01M23Q3GA1');
//     console.log(res);
//     expect(res.statusCode).toEqual(200)
//     expect(res.body).toHaveProperty('username')
//   })
// })

// describe('get user appointments', () => {
//   it('should retrieve the user appointments', async () => {
//     const res = await request(app).get('slackbot/query/U01M23Q3GA1');
//     console.log(res);
//     expect(res.statusCode).toEqual(200)
//     expect(res.body).toHaveProperty('username')
//   })
// })