'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const stripe = require("stripe")("sk_test_mV42WjXHzUOsWnairY9H7tfC");
const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { router: historyRouter } = require('./purchase-history');
const app = express();
const { PORT, DATABASE_URL } = require('./config');
const cors = require('cors');
const { CLIENT_ORIGIN, TRANSACTIONS_CLIENT_ORIGIN, TRANSACTIONS_CLIENT_ORIGIN_INSECURE } = require('./config');
const { PurchaseHistory } = require('./purchase-history/models');

mongoose.Promise = global.Promise;

app.use(require("body-parser").text());
app.use(require("body-parser").json());

const whitelist = [CLIENT_ORIGIN, TRANSACTIONS_CLIENT_ORIGIN, TRANSACTIONS_CLIENT_ORIGIN_INSECURE, 'http://localhost:3000'];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

app.use(cors(corsOptions));

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/api/purchase-history/', historyRouter);

app.get('/api/status', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/transaction-history', (req, res) => {
  PurchaseHistory
    .find()
    .then(items => {
      res.json(items);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went wrong' });
    });
});

app.post('/logout', (req, res) => {
  res.clearCookie('id_token');
  res.redirect('/');
});

//stripe charges get posted here
app.post('/api/charge', async (req, res) => {
  try {
    let { status } = await stripe.charges.create({
      amount: req.body.product,
      currency: "usd",
      description: `${req.body.description} - Ballet Body by Jasmin`,
      source: req.body.token
    });

    res.json({ status });
  }

  catch (err) {
    res.status(500).end();
    console.log(err)
  }
});

let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useNewUrlParser: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
