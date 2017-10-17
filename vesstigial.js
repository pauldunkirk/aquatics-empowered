Too many notes: This code is STILL IN maps.controller.js: I copied it here with notes and deleted notes from maps controller file:
NgMap.getMap().then( map => {
  //J: "ANYTHING REQUIRING ACCESS TO GOOGLE API GOES within this ".then" function
  //J: map is returned as an accessor to all the google functionality via angular
  //P: blank map with properties/functionality but no values
  vm.map = map;
  console.log('map, which has no values yet', map);
  //J getFacilities in-turn calls createMarkerList() and I think i thought that required vm.map
  //P: ?? But neither createMarkerList nor getFacilities use vm.map ???
  //J it doesnt look like that is the case. you could try removing getFacilities() from here and may get a faster page load. //P: tried it- didn't seem to help
  console.log('map.mapUrl - Mpls center, no markers', map.mapUrl);
  //J: TODO: set map center to location of user (determined with from browser query)
  //J: cannot be done until we have an https domain (not free Heroku)
  getFacilities();
}); //end NgMap.getMap



//P: getIcon is only here and html - url ref: http://www.mattburns.co.uk/blog/2011/10/07/how-to-dynamically-choose-the-color-of-you-google-maps-marker-pin-using-javascript/
//P:  first is main pin color: #0065BD =blue, second is fill: FFFFFF =white
// P: TODO different pins for different types of pools
  vm.getIcon = num => 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + (num+1) + '|0065BD|FFFFFF';



FROM maps.controller.js

//we are not adding facilities from the maps page - only geocoding: converting address info to coordinates to reset map
  const addFacility = (facility) => {
    $http({
      method: 'POST',
      url: '/facilities/',
      data: facility,
      headers: {}
    }).then(
      res => console.log('POST success', res),
      err => console.log("error adding facility: ", err) );
  };

  //P: setMarkerVis previously called in newCenter and GeoCode (search) like this:   setMarkerVis(vm.radius);
    const setMarkerVis = radius => {
      console.log('radius', radius);
      for ( let i=0; i < vm.markerList.length; i++) {
        let dist = getDistance(vm.markerList[i].position, vm.mapCenter);
        let inRangeBool = dist < radius;
        vm.markerList[i].visible = inRangeBool || !radius;
    }
    };


  //P: reset is only here and html
  //P: BUT, hideInfoWindow is only here and 10 lines down and comes from Ng-Map
    vm.reset = () => {
      vm.addr = undefined; //see poolSearch and geoCodeAdd
      vm.radius = undefined; // see setMarkerVis
      vm.pool = undefined;
      vm.mapCenter = defaultCenter;
      vm.map.hideInfoWindow('pool-iw'); //see ngmap
      vm.markerList = createMarkerList(vm.allPools, vm.maxMarkers, vm.mapCenter);
    };

*****************************************************************

FROM maps.html

<!-- <input type="number" ng-model="maps.radius" placeholder="Search radius (mi)"/> -->
<!-- <button class="btn-default" type="reset" ng-click="maps.reset()">Reset</button> -->
<!-- <span>Showing (up to) the nearest {{maps.maxMarkers}} pools.</span> -->

*****************************************************************

FROM nav.html
<!-- <li class="nav-item"><a class="nav-link" href="#!surveys">Surveys</a></li> -->
<!-- <li class="nav-item"><a class="nav-link" href="#!surveys">Log In or Register<i class="fa fa-user"></i></a></li> -->





*****************************************************************

FROM ADMIN HTML (still there but took out notes)

<!-- DATABASE VIEW table set up  -->
<div class="row">
  <h2>Database View</h2>
  <form flex="50" id="surveySearch">
    <label>Search Pools in Database</label>
    <input ng-model="query" ng-change="vm.pageCheck((vm.allPools  | filter: query |  excludeByStatus: vm.show.text()).length, vm.current)"/>
    <div class="errors-spacer"></div>
  </form>
  <h3 flex="25" id="surveySearchResults">Results: {{(vm.allPools  | filter: query | excludeByStatus: vm.show.text()).length}} </h3>
  <span>click column heading to sort</span>
  <!-- <div id="filterBoxes" class="row">
    <h3 id="dashFilterBy">Filter By</h3>
    <div layout="column" class="filterBox" ng-repeat="status in vm.show.options">
      <checkbox ng-model="vm.show.statuses[$index]" ng-change="vm.pageCheck((vm.allPools  | filter: query |  excludeByStatus: vm.show.text()).length)">


        {{status}}
      </checkbox>
    </div>
  </div> -->
</div>

**********************

FROM admin controller - see below in facilities (this is when we were dealing with mapmuse data)
cleanFacilities() {
  $http({
    method: 'DELETE',
    url: '/facilities/nullGData',
  }).then(
    res => console.log('DELETE null facilities success', res),
    err => console.log("error deleting form placeId list: ", err) );
},





*****************************************************************
FROM app.js (still there but took out notes)

let isLocal = require('./config/config.js').local;
// console.log('locals', app.locals);
// if (portDecision == 3000) {
//   console.log('localhost detected: setting local database...');
//   app.res.locals.configPath = './config/local.js';
//   isLocal = true;
// } else {
//   console.log('no localhost detected: setting heroku database...');
//   app.res.locals.configPath = './config/heroku.js';
//   isLocal = false;
// }
app.get('/', (req, res) => res.sendFile(path.resolve('server/public/index.html')));

// app.set('/setLocal', () => {
//   res.locals.configPath = './config/local.js';
//   isLocal = true;
// });
//
// app.set('/setHeroku', () => {
//   res.locals.configPath = './config/heroku.js';
//   isLocal = false;
// });
app.get('/local', (req,res) => res.send(isLocal));









app.use('/placeIds', placeIds);

// all server routes will have be processed by the token decoder first.
// therefore all inbound AJAX requests require the Firebase token in the header
// app.use(decoder.token);

app.listen(portDecision, () => console.log("Listening on port:", portDecision));

// const bigList = require('../bigList');
// app.get('/bigList', (req,res) => res.send(bigList));








*****************************************************************
FROM facilities route



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


*this was when we were dealing with mapmuse data
router.delete('/nullGData', function(req, res) {
  pool.connect(function(err, client, done) {
    err && res.sendStatus(503);
    client.query('DELETE FROM facilities WHERE google_places_data IS NULL;',
    function(err, result) {
      done();
      err ? console.log('DELETE ERROR', err, res.sendStatus(500)) : res.sendStatus(200);
    });
  });
});
