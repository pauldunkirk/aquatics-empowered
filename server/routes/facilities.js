const express = require('express');
const router = express.Router();
const config = require('../config/config.js');
const pg = require('pg');
const format = require('pg-format');

const pool = new pg.Pool(config);
const columnNames = '(name, pool_type, street_address, city, state, zip, coords, google_place_id)';

router.post('/many', function(req, res) {
  const bulkFormatted = req.body.map( p => [p.name, p.pool_type, p.street_address, p.city, p.state, p.zip, p.coords, p.google_place_id])
  console.log('bulk facilities to POST', bulkFormatted);
  pool.connect( function(err, client, done) {
    err && res.sendStatus(503);
    client.query(
      format('INSERT INTO facilities ' + columnNames + ' VALUES %L', bulkFormatted),
      function(err) {
        done();
        err ? console.log('POST ERROR', err, res.sendStatus(500)) : res.sendStatus(201);
      }
    );
  });
});

router.post('/', function(req, res) {
  const facil = req.body;
  console.log('facility to POST', facil);
  pool.connect( function(err, client, done) {
    err && res.sendStatus(503);
    client.query(
      'INSERT INTO facilities ' + columnNames + ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [facil.name, facil.pool_type, facil.street_address, facil.city, facil.state, facil.zip, facil.coords, facil.google_place_id],
      function(err) {
        done();
        err ? console.log('POST ERROR', err, res.sendStatus(500)) : res.sendStatus(201);
      }
    );
  });
});

router.get('/', function(req, res) {
  console.log('get facilities');
  pool.connect(function(err, client, done) {
    err && res.sendStatus(503);
    client.query('SELECT * FROM facilities;', function(err, result) {
      done();
      err ? console.log('GET ERROR', err, res.sendStatus(500)) : res.send(result.rows);
    });
  });
});





module.exports = router;
