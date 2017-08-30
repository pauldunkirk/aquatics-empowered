var express = require('express');
var router = express.Router();
var config = require('../config/config.js');
var pg = require('pg');

// var pool = new pg.Pool(config);
var pool = new pg.Pool(config);
var connectionString = 'postgres://localhost:5432/aquaticsempowered';


router.get('/', function(req, res) {
  console.log('get facilities');
  pool.connect(function(err, client, done) {
    if(err) {
      console.log('connection error: ', err);
      res.sendStatus(500);
    }
    client.query('SELECT * FROM facilities;', function(err, result) {
      done();
      if(err) {
        console.log('select query error - getpets ', err);
        res.sendStatus(500);
      }
      res.send(result.rows);
    });
  });
});

router.post('/', function(req, res) {
  var facil = req.body;
  pool.connect(function(err, client, done) {
    if (err) {
      console.log('connection error: ', err);
      res.sendStatus(500);
    }
    client.query(
      'INSERT INTO facilities (name, pool_type, street_address, city, state, zip, coords, google_place_id)' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [facil.name, facil.pool_type, facil.street_address, facil.city, facil.state, facil.zip, facil.coords, facil.google_place_id],
      function(err, result) {
        done();
        if (err) {
          console.log('insert query error: ', err);
          res.sendStatus(500);
        } else {
          res.sendStatus(201);
        }
      });
  });
});

//Get request to populate Company Dropdown
// router.get('/', function(req, res) {
//   console.log('reached get clients route');
//   pool.connect()
//     .then(function(client) {
//       client.query('SELECT * FROM client ORDER BY client_name')
//         .then(function(result) {
//           client.release();
//           console.log('number of clients sent:', result.rows.length);
//           res.send(result.rows);
//         })
//         .catch(function(err) {
//           console.log('select query error: ', err);
//           client.release();
//           res.sendStatus(500);
//         });
//     });
// });


module.exports = router;
