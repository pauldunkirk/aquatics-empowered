const express = require('express');
const router = express.Router();
const config = require('../config/config.js');
const pg = require('pg');

const pool = new pg.Pool(config);

//UPDATE THIS WHEN UPDATING TABLE LAYOUT
const facilitiesColumns = [
  "google_place_id",
  "users_id",
  "name",
  "street_address",
  "city",
  "state",
  "zip",
  "phone",
  "description",
  "image_url",
  "url",
  "keyword",
  "coords",
  "ae_details",
  "google_places_data"
];

const postAllProps = (postObj, tableColumns) => {
  //all of the properties of postObj that are also included in database table
  let keys = Object.keys(postObj).filter( key => tableColumns.includes(key) );
  let values = [];
  let refs = '';
  let cols = keys.join(', ');
  for (let i = 0; i < keys.length; i++) {
    values.push(postObj[keys[i]]);
    refs += ('$' + (i+1) + ', ');
  }
  //remove trailing ', '
  refs = refs.slice(0, refs.length-2)
  return { values, refs, cols };
}

router.delete('/byId/:id', function(req, res) {
  const id = req.params.id;
  console.log('delete facility', id);
  pool.connect(function(err, client, done) {
    err && res.sendStatus(503);
    client.query('DELETE FROM facilities WHERE id = $1;', [id],
    function(err, result) {
      done();
      err ? console.log('DELETE ERROR', err, res.sendStatus(500)) : res.sendStatus(201);
    });
  });
});

router.delete('/nullGData', function(req, res) {
  pool.connect(function(err, client, done) {
    err && res.sendStatus(503);
    client.query('DELETE FROM facilities WHERE google_places_data IS NULL;',
    function(err, result) {
      done();
      err ? console.log('DELETE ERROR', err, res.sendStatus(500)) : res.sendStatus(201);
    });
  });
});

router.post('/', function(req, res) {
  const query = postAllProps(req.body, facilitiesColumns);
  pool.connect( function(err, client, done) {
    err && res.sendStatus(503);
    client.query(
      'INSERT INTO facilities (' + query.cols + ') VALUES (' + query.refs + ')',
      query.values,
      function(err) {
        done();
        err ? res.sendStatus(500) : res.sendStatus(201);
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

// const format = require('pg-format');
// router.post('/many', function(req, res) {
//   const bulkFormatted = req.body.map( p => [p.name, p.pool_type, p.street_address, p.city, p.state, p.zip, p.phone, p.image_url, p.url, p.coords, p.google_place_id, p.google_places_data])
//   console.log('bulk facilities to POST', bulkFormatted);
//   pool.connect( function(err, client, done) {
//     err && res.sendStatus(503);
//     console.log('formnatted', format('INSERT INTO facilities ' + columnNames + ' VALUES %L', bulkFormatted));
//     client.query(
//       format('INSERT INTO facilities ' + columnNames + ' VALUES %L', bulkFormatted),
//       function(err) {
//         done();
//         err ? console.log('POST ERROR', err, res.sendStatus(500)) : res.sendStatus(201);
//       }
//     );
//   });
// });



module.exports = router;
