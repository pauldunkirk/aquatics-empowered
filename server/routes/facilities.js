const express = require('express');
const router = express.Router();
const config = require('../config/config.js');
const pg = require('pg');
const pool = new pg.Pool(config);

//UPDATE THIS WHEN UPDATING TABLE LAYOUT
const facilitiesColumns = [
  "google_place_id", "users_id", "name", "street_address", "city", "state", "zip",
  "phone","description","image_url","url","keyword","coords","ae_details","google_places_data"
];

const postAllProps = (postObj, tableColumns) => {
  //J: all of the properties of postObj that are also included in database table
  let keys = Object.keys(postObj).filter( key => tableColumns.includes(key) );
  let values = [];
  let refs = '';
  let keysJoined = keys.join(', ');
  for (let i = 0; i < keys.length; i++) {
    values.push(postObj[keys[i]]);
    refs += ('$' + (i+1) + ', ');
  }
  //J: remove trailing ', '
  refs = refs.slice(0, refs.length-2)
  return { values, refs, keysJoined };
}

router.post('/', function(req, res) {
  const query = postAllProps(req.body, facilitiesColumns);
  pool.connect( function(err, client, done) {
    err && res.sendStatus(503);
    client.query(
      'INSERT INTO facilities (' + query.keysJoined + ') VALUES (' + query.refs + ')',
      query.values,
      function(err) {
        done();
        err ? console.log('DELETE ERROR', err, res.sendStatus(500)) : res.sendStatus(200);
      }
    );
  });
});

//makes query without google places data. much faster - http not setup yet
router.get('/noGoogleData', function(req, res) {
  console.log('get facilities without google places data');
  const colsSliced =
    facilitiesColumns
    .slice(0, facilitiesColumns.length-1)
    .concat(['id', 'last_updated', 'date_added']);
  const colsJoined = colsSliced.join(', ');
  console.log('colsJoined', colsJoined);
  pool.connect(function(err, client, done) {
    err && res.sendStatus(503);
    client.query('SELECT ' + colsJoined + ' FROM facilities;', function(err, result) {
      done();
      err ? console.log('GET ERROR', err, res.sendStatus(500)) : res.send(result.rows);
    });
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

router.delete('/byId/:id', function(req, res) {
  const id = req.params.id;
  console.log('delete facility', id);
  pool.connect(function(err, client, done) {
    err && res.sendStatus(503);
    client.query('DELETE FROM facilities WHERE id = $1;', [id],
    function(err, result) {
      done();
      err ? console.log('DELETE ERROR', err, res.sendStatus(500)) : res.sendStatus(200);
    });
  });
});

module.exports = router;
