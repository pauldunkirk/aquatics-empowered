//methods for parsing datasets from different sources into usable JSON
vm.toJson = {
  mapMuse(text) {
    let arr = text.split('\n'); //create array element for each line of text
    arr = arr.filter( entry =>  /\S/.test(entry)); //remove empty lines
    arr = arr.map( val => val.trim()); //remove leading/trailing whitespace
    const musePools = [];
    for (var i = 0; i < arr.length-3; i=i+3) {
      //two capital letters followed by end of string = state
      let state = arr[i+2].match(/[A-Z][A-Z]$/g)[0];
      //remove the last 3 chars (state and preceding space)
      let noState = arr[i+2].slice(0, arr[i+2].length-3);
      //one or more words (optionally followed by a space) between ", " and end of string = city
      let city = noState.match(/(?!, )(\w *)+(?=$)/g)[0];
      //everything before the above ", " will be the street address
      let street_address = noState.match(/.+(?=(, (\w *)+(?=$)))/g)[0];
      musePools.push( {
        source: 'mapmuse',
        name: arr[i],
        pool_type: arr[i+1],
        street_address,
        city,
        state,
      } )
    }
    vm.text = JSON.stringify(musePools, undefined, 4);
    console.log('musePools', musePools);
  },
  //this section is incomplete
  // google(text) {
  //   let arr = text.split('\n'); //create array element for each line of text
  //   const googPools = [];
  //   for (var i = 0; i < arr.length-3; i=i+2) {
  //     let name = arr[i];
  //     let city = arr[i+1].split(', ')[0];
  //     let state = arr[i+1].split(', ')[1];
  //     googPools.push( {
  //       source: 'google',
  //       name,
  //       city,
  //       state,
  //     } )
  //   }
  // }
}

const geocodeAdd = facility => {
  const address = facility.street_address + ', ' + facility.city + ', ' + facility.state;
  const url = geoBase + (address).replace(' ', '+') + apiKeyEnd;
  //access google API via url
  $http.get(url).then( res => {
    console.log('geocode res', res);
    if (res.data.status == "OK") {
      const locData = res.data.results[0];
      const zipCmp = locData.address_components.find(
        addrCmp => addrCmp.types[0] == 'postal_code');
      const coords = locData.geometry.location;
      //assign values from GeoCode query
      facility.coords = [coords.lat, coords.lng];
      facility.zip = zipCmp.long_name;
      facility.google_place_id = locData.place_id;
      console.log('geocoded facility:', facility);
      addFacilityToDb(facility);
    } else {
      console.log('no location found:', url, results);
    }
  });
};

vm.geocodeAndPost = (jsonString, index=0) => {
  vm.errorCount = 0;
  const json = JSON.parse(jsonString);
  const list = $.map(json, el => el);
  console.log('list', list);
  pulsePost(list);

  function pulsePost(list) {
    if (index < list.length) {
      setTimeout( () => {
        geocodeAdd(list[index++]);
        pulsePost(list);
      }, 1100);
    }
    vm.geocodesLeft = list.length - index;
  };
};

//returns a boolean
vm.validateJson = (text='') => (
  (/^[\],:{}\s]*$/.test(
      text.replace(/\\["\\\/bfnrtu]/g, '@')
      .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
      .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
    )) && text!=''
)

// 
// //from maps controller
//
//   const geoCodeAdd = facility => {
//     let addr = facility.street_address + ', ' + facility.city + ' ' + facility.state;
//     GeoCoder.geocode({address: addr})
//     .then( results => {
//       let zipCmp = results[0].address_components.find(
//         addrCmp => addrCmp.types[0] == 'postal_code');
//       if (zipCmp) {
//         let coords = results[0].geometry.location;
//         facility.coords = [coords.lat(), coords.lng()];
//         facility.zip = zipCmp.long_name;
//         facility.google_place_id = results[0].place_id;
//         console.log('geocoded facility:', facility);
//         addFacility(facility);
//       } else {
//         console.log('no zip found:', addr, results);
//       }
//     });
//   };
//
//   const convertAndPostJSON = (route, index=0) => {
//     const pulsePost = list => {
//       if (index < list.length - 1) {
//         setTimeout( () => {
//           geoCodeAdd(list[index++]);
//           pulsePost(list);
//         }, 1100);
//       }
//       console.log(list.length - index, 'facilities remaining');
//     };
//     $http.get(route)
//     .then( res => pulsePost(res.data),
//            err => console.error('GET JSON facilities - error:', err)
//     );
//   };


//
// <div class="col-md-3">
//   <p>Number of pools: {{admin.allPools.length}}</p>
//   <p>Select data source, paste data, then click 'Convert'</p>
//   <p>
//     with google results, choose 'paste values only' when pasting to spreadsheet
//   </p>
//   <div class="form-group">
//     <button ng-hide="true" class="btn form-control"
//         ng-disabled="true"
//         ng-click="admin.toJson.google(admin.text)">
//         Convert google data to JSON
//
//     </button>
//     <button class="btn form-control"
//         ng-disabled="admin.validateJson(admin.text)"
//         ng-click="admin.toJson.mapMuse(admin.text)">
//         Convert mapMuse data to JSON
//     </button>
//     <button class="btn form-control"
//         ng-disabled="!admin.validateJson(admin.text)"
//         ng-click="admin.geocodeAndPost(admin.text)">
//       {{admin.validateJson(admin.text) ? "Add to DB!" : "Invalid JSON!"}}
//     </button>
//     <br />
//     <h4 ng-if="admin.geocodesLeft">
//       Geocoding and adding to database... <br/>
//       {{admin.geocodesLeft}} facilities remaining. <br />
//       {{admin.errorCount}} errors.
//     </h4>
//   </div>
//
// </div>
// <div class="col-md-5">
//   <textarea id="jsonConvert" cols="80" rows="40" ng-model="admin.text" />
// </div>
