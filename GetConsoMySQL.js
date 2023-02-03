const { login } = require('tplink-cloud-api');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');

const TPLINK_TERM = uuidv4();

const TPLINK_USER = process.env.TPLINK_USER;
const TPLINK_PASS = process.env.TPLINK_PASS;
const TPLINK_DEVICE = process.env.TPLINK_DEVICE;

const DBHOST = process.env.DBHOST;
const DBPORT = process.env.DBPORT;
const DBUSER = process.env.DBUSER;
const DBPWD = process.env.DBPWD;
const DATABASE = process.env.DATABASE;
const TABLE = process.env.TABLE;


const POWER_LOW = 15000;
const POWER_HIGH = 100000;
const LITERS_HOUR = 2.27125;

const POWER_OFF = 0;
const POWER_STANDBY = 1;
const POWER_RECYCLE = 2;
const POWER_BURN = 3;

async function main() {
  entree = Date.now();
  const tplink = await login(TPLINK_USER, TPLINK_PASS, TPLINK_TERM);
  const dl = await tplink.getDeviceList();
  let myPlug = await tplink.getHS110(TPLINK_DEVICE);
  let powerMW = (await myPlug.getPowerUsage()).power_mw;
  switch (true) {
    case (powerMW < POWER_LOW):
      state = POWER_STANDBY;
      break;
    case (powerMW < POWER_HIGH):
      state = POWER_RECYCLE;
      break;
    default:
      state = POWER_BURN;
      break;
  }
  var date = new Date();
  var mySQLDateString = date.toISOString().slice(0, 19).replace('T', ' ');
  values = "'"+mySQLDateString+"'," + powerMW + ',' + state;
  
  const connection = await mysql.createConnection({
    host: DBHOST,
    port: DBPORT,
    user: DBUSER,
    password: DBPWD,
    database: DATABASE
  });
  
  connection.query("INSERT INTO " + TABLE + " VALUES(" + values + ")");
  connection.end();
  
  duree = Date.now() - entree;
  console.log(values, duree);
  await new Promise(r => setTimeout(r, 1000 - duree));

}

main();


