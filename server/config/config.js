// const url = require('url');
// const params = url.parse(process.env.DATABASE_URL);
// const auth = params.auth ? params.auth.split(':') : ['', ''];
//
// const config = {
//   user: auth[0],
//   password: auth[1],
//   host: params.hostname,
//   port: params.port,
//   database: params.pathname.split('/')[1],
//   ssl: params.auth ? true : false //use SSL if credentials are supplied
// };

//FOR LOCAL SERVER
const config = {
  user: '',
  host: 'localhost',
  port: '5432',
  database: 'aquaticsempowered',
  ssl: false //use SSL if credentials are supplied
};

console.log("\n\nCONFIG: ", config);

module.exports = config;
