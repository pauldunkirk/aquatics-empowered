app.controller('AdminController', ['$http', function($http) {
  const vm = this;
  //Places API (becuase NgMap no access to radar)
  const googlePlacesAPI = new google.maps.places.PlacesService(document.createElement('div'));
  //a JSON w/ 1000 biggest US cities and coords - see get, filter, plse
  vm.cityCoordsUrl =  'https://gist.githubusercontent.com/Miserlou/c5cd8364bf9b2420bb29/raw/2bf258763cdddd704f8ffd3ea9a3e81d25e2c6f6/cities.json';
  vm.citiesLeft = [0]; //array to allow passing by reference to plse()
  vm.placesLeft = [0];
  vm.errorCount = 0;
  vm.placeIdsFromRadarTable = [];
  vm.abort = false;
  vm.pulsing = false;
  //****************************************************************************************************
//in progress - a way to search for pools by typing in a city not on list of 1000 biggest
  vm.poolSearch = () => {
    if (vm.addr) {
      GeoCoder.geocode({address: vm.addr}) //ref see vestigial
        .then( (results, status) => {  //results[0]==Google's 'best guess'
        console.log('results', results);
          // let latitude: results[0].geometry.location.lat();
          // let longitude: results[0].geometry.location.lng();
        });}};

  //****************************************************************************************************
  // https://developers.google.com/places/web-service/search
  // https://developers.google.com/maps/documentation/javascript/examples/place-radar-search
  function searchCities(cityCoords) { //search Cities called in plse in "citiesRadarSearch" below
    const location = new google.maps.LatLng(cityCoords.latitude, cityCoords.longitude);
    const request = {
      radius: 50000, //50000 max radius allowed by google. tops out at 200 nearest
      keyword: vm.keywords,  //search term
      location, //LatLng object from above
    }
    googlePlacesAPI.radarSearch(request, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        console.error('google places service error:', status);
        return;
      }

      //trying to split up lat and longitude - logging before map method found that map method is needed
      // lat and long buried deep in closures of geometry console.log('citiesRadarSearch, searchCities, googlePlacesAPI.radarSearch results', results);
      // returns undefined: console.log('citiesRadarSearch, searchCities, googlePlacesAPI.radarSearch results geometry', results.geometry);
      //error "cannot read property 'location' of undefined" console.log('results lng', results.geometry.location.lng());

      const placeIdList = results.map( pool => (
        { latitude: pool.geometry.location.lat(),
          longitude: pool.geometry.location.lng(),
          place_id: pool.place_id,
          keyword: request.keyword}
      ) )

      // working one:
      // const placeIdList = results.map( pool => (
      //   { coords: [pool.geometry.location.lat(), pool.geometry.location.lng()],
      //     place_id: pool.place_id,
      //     keyword: request.keyword}
      // ) )
      console.log('placeIdlist: place-id, coords, keyword)', placeIdList);
      //
      for (const idObject of placeIdList) vm.db.addPlaceId(idObject);
    } ); //end radarSearch
  }; //end search cities


//******************************************************************************************************

  vm.googlePlaces = {
    citiesRadarSearch(num=1) {
      const filteredCityList = vm.cityTable.cityList.filter(cityTable => cityTable.include);
      console.log('filtered City List', filteredCityList);
      pulse(searchCities, filteredCityList, vm.citiesLeft, 1100, 0);
    },
    // get PlaceIds from Radar Table (uses no api queries)
    getPlaceIdList() {
      $http.get('/radar').then(
        res => {
            vm.placeIdsFromRadarTable = res.data;
            console.log('placeIdsFromRadarTable', placeIdsFromRadarTable);
        },  err => console.log('error accessing place id table', err)
      )
    },



    //takes a list of place Ids, gets google info for EACH id, adds to db
    getInfoFromIds(placeIdList) {
      // placeIdList = placeIdList.filter( n => n ); //remove empty list items
      //calls vm.googlePlaces.getDetails for each in placeIdList
      return pulse(vm.googlePlaces.getDetails, placeIdList, vm.placesLeft, 1100, 0)
    },
    //gets the google details of an item with a google places id property
    getDetails(radarPlace) {
      console.log('radarPlace', radarPlace);
      googlePlacesAPI.getDetails( {placeId: radarPlace.place_id}, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          console.log('place', place);
          const facility = vm.googlePlaces.parseDetails(place, radarPlace.keyword, vm.requireReview);
          //add to DB if parseDetails did not return NULL
          if (facility) {
            vm.db.addFacility(facility);
          }
        } else {
          console.log('googlePlacesAPI error', status);
        }
      }); //end get Details. googlePlaces API
    }, //end get Details

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
      console.log('loc = pResult.geometry.location', loc);
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
    getFacilitiesForAdmin() { //called in init
      let ms = 0;
      setInterval(()=>ms++, 1);
      $http.get('/facilities/')
      .then( res => {
        console.log(ms, ':milliseconds for getFacilitiesForAdmin response');
        console.log(memorySizeOf(res), ":size of server response to getFacilitiesForAdmin");
        vm.allPools = res.data;
        console.log('vm.allPools from admin contrlr', vm.allPools);
      },   err => console.log('GET pools - error:', err)
      );
    },
    getType() {
      $http.get('/local/')
      .then( res => vm.dbType = (res.data ? 'LOCAL' : 'HEROKU') ,
             err => console.log('GET local - error:', err)
      );
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
    //
    // populateFacilityTable(radarPlaceIds) {
    //   $http({
    //     method: 'POST',
    //     url: '/facilityDetails/',
    //     data: radarPlaceIds
    //   }).then(
    //     res => {  console.log('POST success', res, vm.numAdded++) },
    //     err => console.log("error adding facility: ", facility, err, vm.errorCount++) );
    // },
    addFacility(facility) {
      $http({
        method: 'POST',
        url: '/facilities/',
        data: facility
      }).then(
        res => {  console.log('POST success', res, vm.numAdded++) },
        err => console.log("error adding facility: ", facility, err, vm.errorCount++) );
    },

    // removes entries with place Ids that exist in facilities table
    cleanIdList() {
      $http({
        method: 'DELETE',
        url: '/radar/alreadyInFacilities/',
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
      }).then( // J: removal function in client.js for global accessibility (P: umm...? NOT in client.js, only here see below)
        res => { removeObjById(vm.allPools, id) },
        err => console.log("error deleting from placeId list: ", err) );
    }
  }
  /****************************UTILITIES************************************/
      // removes item from object based on .id property - see deleteFacility above
      function removeObjById(arr, id) {
        var idx = arr.findIndex(item => item.id === id);
        ~idx && arr.splice(idx, 1);
        return idx;
      };

  //************************* PLSE *****************************
  function pulse(queryFn, list, remaining, delay, index=0) {
    if ( (list.length > index) && !vm.abort) {
      vm.pulsing = true;
      setTimeout( () => {
        if (vm.abort) {
          console.log('aborting pulse');
          remaining[0] = 0;
          vm.abort = false;
          vm.pulsing = false;
          return;
        }
        queryFn(list[index++]);
        remaining[0] = list.length - index; //for display on DOM
        //calls itself w/ delay and incremented index
        pulse(queryFn, list, remaining, delay, index);
      }, delay);
    } //end pulsing true if
  }; //end plse function

  /***************************INITIALIZATION ***************************/
  const init = () => {
    vm.db.getFacilitiesForAdmin();
    // undefinfed at this point - see 151
    vm.db.getType();

    $http.get(vm.cityCoordsUrl).then(
      res => vm.cityTable.cityList = res.data,
      err => console.log('could not find cities JSON', err)
    );
  }
  init();


/***************************CITY TABLE SEARCH FILTER ***************************/
  vm.cityTable = {
    currentPage: 0,
    pageSize: 20,
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
      vm.cityTable.sortReverse = !vm.cityTable.sortReverse;
      vm.cityTable.sortType = column;
    },
    pageCheck: function(numResults) {
      var total = vm.cityTable.totalPages(numResults);
      if (vm.cityTable.currentPage >= total || ((vm.cityTable.currentPage == -1) && total)) {
        vm.cityTable.currentPage = total -1 ;
      }
    },
    totalPages: function (num) {
      var total = 0;
      if (num) {
        total = parseInt(((num - 1) / vm.cityTable.pageSize) + 1);
      }
      return total;
    },
  }
/****************************DB SEARCH FILTER************************************/
    vm.currentPage = 0;
    vm.pageSize = 100;
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
    }; //end vm.show
    vm.setSort = column => {
      vm.sortReverse = !vm.sortReverse;
      vm.sortType = column;
    }; //end vm.setSort
    vm.pageCheck = function(numResults) {
      var total = vm.totalPages(numResults);
      if (vm.currentPage >= total || ((vm.currentPage == -1) && total)) {
        vm.currentPage = total -1 ;
      }
    }; //end vm.pageCheck
    vm.totalPages = function (num) {
      var total = 0;
      if (num) {
        total = parseInt(((num - 1) / vm.cityTable.pageSize) + 1);
      }
      return total;
    }; //end vm.totalPages

//***************************LOG DATA OF POOL - ADMIN DB VIEW *************************************************
  vm.log = data => console.log(data);
//****************************************************************************
  // computes size of nested objects
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
  };
//****************************************************************************
}]); //end controller
