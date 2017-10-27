app.controller('AdminController', ['$http', function($http) {
  const vm = this;
  //Places API (becuase NgMap no access to radar)
  const gPlacesAPI = new google.maps.places.PlacesService(document.createElement('div'));
  //a JSON w/ 1000 biggest US cities and coords - see get line 224 - as vm.c.cityList then filteredCityList in findIds in gPlaces in pulse
  vm.cityCoordsUrl =  'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';
  vm.citiesLeft = [0]; //array to allow passing by reference to pulse()
  vm.placesLeft = [0];
  vm.geocodesLeft = 0;
  vm.errorCount = 0;
  vm.gPlaceIdList = [];
  vm.abort = false;
  vm.pulsing = false;
  /***************************GOOGLE QUERYING ***************************/
  function pulse(queryFn, list, remaining, delay, index=0) {
    if((list.length > index) && !vm.abort){
      vm.pulsing = true;
      setTimeout( () => {
        if (vm.abort) {
          console.log('aborting pulse');
          remaining[0] = 0;
          vm.abort = false;
          vm.pulsing = false;
          return;
        }
        //run the function on the data in the current index location of the list
        //increment the index
        queryFn(list[index++]);
        //stores relevant data for items remaining at position zero of array
        //using array to pass by reference to location in memory, so the value at that location is altered.
        //only necessary for displaying amount remaining on DOM
        remaining[0] = list.length - index;
        //recursively calls itself with new incremented index
        pulse(queryFn, list, remaining, delay, index);
      }, delay);
    }
  };

  function searchCity(cityCoords) {
    //create gMaps LatLng object (required for radar search) with city coords
    const location = new google.maps.LatLng(
      cityCoords.latitude, cityCoords.longitude);
    const request = {
      //max radius allowed by google. will top out at 200 nearest results
      radius: 50000,
      //search term
      keyword: vm.keywords,
      //LatLng object from above
      location,
    }
    gPlacesAPI.radarSearch(request, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        console.error('google places service error:', status);
        return;
      }
      //makes array of objects with these three properties from the google radar results
      const idList = results.map( pool => (
        { coords: [pool.geometry.location.lat(), pool.geometry.location.lng()],
          place_id: pool.place_id,
          keyword: request.keyword}
      ) )
      console.log('idlist: place-id, coords, keyword)', idList);
      //ES6 for loop functionality. look up "for of loop" - addPlaceId here and 170
      for (const idObject of idList) vm.db.addPlaceId(idObject);
    } );
  }; //end searchCity

//*******************************************************************************************************

  //P: html: "query selected cities, add to Radar Table"
  vm.gPlaces = {
    findIds(num=1) {
      const filteredCityList = vm.c.cityList.filter(c => c.include);
      console.log('filteredCityList', filteredCityList);
      pulse(searchCity, filteredCityList, vm.citiesLeft, 1100, 0);
    },
    // get PlaceIds from Radar Table (uses no api queries)
    getIdList() {
      $http.get('/radar').then(
        res => vm.gPlaceIdList = res.data,
        err => console.log('error accessing place id table', err)
      )
    },
    //takes a list of google Ids, gets google info for EACH id, adds to db
    getInfoFromIds(idList) {
      idList = idList.filter( n => n ); //remove empty list items

      //calls vm.gPlaces.getDetails for each iteration/item in idList
      //tallies remaining places in vm.placesLeft[0]
      //waits 1100ms between each iteration
      //starts at position 0 (beginning) of idList
      return pulse(vm.gPlaces.getDetails, idList, vm.placesLeft, 1100, 0)
    },
    //gets the google details of an item with a google places id property
    getDetails(basicPlace) {
      console.log('basicPlace', basicPlace);
      gPlacesAPI.getDetails( {placeId: basicPlace.place_id}, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          console.log('place', place);
          const facility = vm.gPlaces.parseDetails(place, basicPlace.keyword, vm.requireReview);
          //add to DB if parseDetails did not return NULL
          if (facility) {
            vm.db.addFacility(facility);
          }
        } else {
          console.log('gPlacesAPI error', status);
        }
      });
    },
    //put google place details into format for our DB
    parseDetails(pResult, keyword, requireReview) {
      //check if reviews are required and exist in google data
      if (requireReview && pResult.reviews==[]) {
        return null;
      }
      let adrCmps = {}; //format address components of gmaps for usability
      //this jQuery magic to reformat the result was copied from the internet:
      $.each(pResult.address_components, (k,v1) => $.each(v1.types, (k2, v2) =>
        adrCmps[v2]=v1.short_name)
      );
      const loc = pResult.geometry.location;
      return {
        name: pResult.name,
        street_address: adrCmps.street_number + ' ' + adrCmps.route,
        city: adrCmps.locality,
        state: adrCmps.administrative_area_level_1,
        zip: adrCmps.postal_code,
        phone: pResult.formatted_phone_number,
        image_url: pResult.photos,
        url: pResult.website,
        coords: [loc.lat(), loc.lng()],
        keyword: keyword,
        google_place_id: pResult.place_id,
        //ALL of the google details are kept in this JSON
        google_places_data: JSON.stringify(pResult, undefined, 4)
      }
    }
  };


/***************************DATABASE METHODS ***************************/

  vm.db = {
    getFacilities() {
      let ms = 0;
      setInterval(()=>ms++, 1);
      $http.get('/facilities/')
      .then( res => {
        console.log(ms, ':milliseconds for getFacilities response');
        console.log(memorySizeOf(res), ":size of server response");
        vm.allPools = res.data;},
             err => console.log('GET pools - error:', err)
      );
    },
    getType() {
      $http.get('/local/')
      .then( res => vm.dbType = (res.data ? 'LOCAL' : 'HEROKU') ,
             err => console.log('GET local - error:', err)
      );
    },
    addFacility(facility) {
      $http({
        method: 'POST',
        url: '/facilities/',
        data: facility
      }).then(
        res => {  console.log('POST success', res, vm.numAdded++) },
        err => console.log("error adding facility: ", facility, err, vm.errorCount++) );
    },
    addPlaceId(placeObject) {
      $http({
        method: 'POST',
        url: '/radar/',
        data: placeObject
      }).then(
        res => vm.numAdded++,
        err => console.log("error adding placeObject: ", placeObject, err, vm.errorCount++) );
    },
    // removes entries with place Ids that exist in facilities table
    cleanIdList() {
      $http({
        method: 'DELETE',
        url: '/radar/allDuplicates/',
      }).then(
        res => console.log('DELETE success'),
        err => console.log("error deleting form placeId list: ", err) );
    },
    deleteAllRadarTable() {
      $http({
        method: 'DELETE',
        url: '/radar/all/',
      }).then(
        res => console.log('DELETE success'),
        err => console.log("error deleting form placeId list: ", err) );
    },
    deleteFacility(id) {
      $http({
        method: 'DELETE',
        url: '/facilities/byId/' + id,
      }).then( //J: below removal function in client.js for global accessibility
        res => { removeObjById(vm.allPools, id) },
        err => console.log("error deleting form placeId list: ", err) );
    },
    deleteFromIdList(placeId) {
      $http({
        method: 'DELETE',
        url: '/radar/byId/' + placeId,
      }).then(
        res => console.log('DELETE success'),
        err => console.log("error deleting form placeId list: ", placeId) );
    }
  }
  /***************************INITIALIZATION ***************************/

  //J: run immediately for initialization
  const init = () => {
    vm.db.getFacilities();
    vm.db.getType();

    $http.get(vm.cityCoordsUrl).then(
      res => vm.c.cityList = res.data,
      err => console.log('could not find cities JSON', err)
    );
  }
  init();
/***************************CITY SEARCH FILTER ***************************/

  vm.c = {
    currentPage: 0,
    pageSize: 25,
    filtered: [],
    loading: false,
    sortType: 'city', // set the default sort type
    sortReverse: false,  // set the default sort order
    show: {
      options: ['Pending', 'Dispatched', 'Completed', 'Declined'],
      statuses: [true, true, true, true],
      text: function () {
        var ret = [];
        var pendBool = (!this.statuses[0] && this.options[0]);
        var dispBool = (!this.statuses[1] && this.options[1]);
        var compBool = (!this.statuses[2] && this.options[2]);
        var decBool = (!this.statuses[3] && this.options[3]);
        if (compBool) { ret.push(compBool); }
        if (decBool) { ret.push(decBool); }
        if (dispBool) { ret.push(dispBool); }
        if (pendBool) { ret.push(pendBool); }
        return ret;
      }
    },
    setSort: function(column) {
      vm.c.sortReverse = !vm.c.sortReverse;
      vm.c.sortType = column;
    },
    pageCheck: function(numResults) {
      var total = vm.c.totalPages(numResults);
      if (vm.c.currentPage >= total || ((vm.c.currentPage == -1) && total)) {
        vm.c.currentPage = total -1 ;
      }
    },
    totalPages: function (num) {
      var total = 0;
      if (num) {
        total = parseInt(((num - 1) / vm.c.pageSize) + 1);
      }
      return total;
    },
  }

/****************************DB SEARCH FILTER************************************/

    vm.currentPage = 0;
    vm.pageSize = 20;
    vm.filtered = [];
    vm.loading = false;
    vm.sortType = 'name'; // set the default sort type
    vm.sortReverse = true;  // set the default sort order
    vm.show = {
      options: ['Pending', 'Dispatched', 'Completed', 'Declined'],
      statuses: [true, true, true, true],
      text: function () {
        var ret = [];
        var pendBool = (!this.statuses[0] && this.options[0]);
        var dispBool = (!this.statuses[1] && this.options[1]);
        var compBool = (!this.statuses[2] && this.options[2]);
        var decBool = (!this.statuses[3] && this.options[3]);
        if (compBool) { ret.push(compBool); }
        if (decBool) { ret.push(decBool); }
        if (dispBool) { ret.push(dispBool); }
        if (pendBool) { ret.push(pendBool); }
        return ret;
      }
    };
    vm.setSort = column => {
      vm.sortReverse = !vm.sortReverse;
      vm.sortType = column;
    }
    vm.pageCheck = function(numResults) {
      var total = vm.totalPages(numResults);
      if (vm.currentPage >= total || ((vm.currentPage == -1) && total)) {
        vm.currentPage = total -1 ;
      }
    };
    vm.totalPages = function (num) {
      var total = 0;
      if (num) {
        total = parseInt(((num - 1) / vm.c.pageSize) + 1);
      }
      return total;
  };

  /****************************UTILITIES************************************/

  //J: removes irem from object based on .id property
  function removeObjById(arr, id) {
    var idx = arr.findIndex(item => item.id === id);
    ~idx && arr.splice(idx, 1);
    return idx;
  }

  //J: logs whatever you send from the DOM
  vm.log = data => console.log(data);
  //J: computes size of nested objects
  function memorySizeOf(obj) {
    var bytes = 0;
    function sizeOf(obj) {
      if(obj !== null && obj !== undefined) {
        switch(typeof obj) {
          case 'number':
            bytes += 8;
            break;
          case 'string':
            bytes += obj.length * 2;
            break;
          case 'boolean':
            bytes += 4;
            break;
          case 'object':
            var objClass = Object.prototype.toString.call(obj).slice(8, -1);
            if(objClass === 'Object' || objClass === 'Array') {
              for(var key in obj) {
                if(!obj.hasOwnProperty(key)) continue;
                sizeOf(obj[key]);
              }
            } else bytes += obj.toString().length * 2;
            break;
          default:
            //throws this when encountering functions as data types:
            //console.log('bad data type', typeof obj);
        }
      }
      return bytes;
    };
    function formatByteSize(bytes) {
        if(bytes < 1024) return bytes + " bytes";
        else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
        else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
        else return(bytes / 1073741824).toFixed(3) + " GiB";
    };
    return formatByteSize(sizeOf(obj));
  }
}]);
