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
