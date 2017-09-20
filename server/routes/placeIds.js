const express = require('express');
const router = express.Router();
const config = require('../config/config.js');
const pg = require('pg');

const pool = new pg.Pool(config);

const columnNames = '(coords, place_id, coord_list, search_string)';

router.get('/', function(req, res) {
  console.log('get google_radar_results');
  pool.connect(function(err, client, done) {
    err && res.sendStatus(503);
    client.query('SELECT * FROM google_radar_results;', function(err, result) {
      done();
      err ? console.log('GET ERROR', err, res.sendStatus(500)) : res.send(result.rows);
    });
  });
});

router.post('/', function(req, res) {
  const facil = req.body;
  pool.connect( function(err, client, done) {
    err && res.sendStatus(503);
    client.query(
      'INSERT INTO google_radar_results ' + columnNames + ' VALUES ($1, $2, $3, $4)',
      [facil.coords, facil.place_id, facil.coord_list, facil.search_string],
      function(err) {
        done();
        err ? res.sendStatus(500) : res.sendStatus(201);
      }
    );
  });
});

module.exports = router;