//returns a boolean
vm.validateJson = (text='') => (
  (/^[\],:{}\s]*$/.test(
      text.replace(/\\["\\\/bfnrtu]/g, '@')
      .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
      .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
    )) && text!=''
)



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
