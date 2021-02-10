const request = require('supertest')
const express = require('express');

const app = require('../../app');

const {MongoClient} = require('mongodb');
const { MongoMemoryServer } =  require('mongodb-memory-server');

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

let mongoServer;
// const opts = { useMongoClient: true }; // remove this option if you use mongoose 5 and above

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await MongoClient.connect(mongoUri,  (err) => {
    if (err) console.error(err);
  });
});

afterAll(async () => {
  
  await mongoServer.stop();
});

describe("get user appointments", () => {
  it('should retrieve the user appointments', async () => {
    const res = await request(app).get('slackbot/query/U01M23Q3GA1');
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('username')
  
  });
});