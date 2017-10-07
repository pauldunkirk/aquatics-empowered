const url = require('url');
const params = url.parse(process.env.DATABASE_URL);
const auth = params.auth.split(':');

// const config = {
//   local: false,
//   user: auth[0],
//   password: auth[1],
//   host: params.hostname,
//   port: params.port,
//   database: params.pathname.split('/')[1],
//   ssl: true
// };

//FOR LOCAL SERVER

const config = {
  local: true,
  user: '',
  host: 'localhost',
  port: '5432',
  database: 'aquaticsempowered',
  ssl: false //use SSL if credentials are supplied
};

console.log("\n\nCONFIG: ", config);

module.exports = config;
