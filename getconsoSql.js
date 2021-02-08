const { login } = require("tplink-cloud-api");
const uuidV4 = require("uuid/v4");
const mysql = require('mysql');

const TPLINK_TERM = uuidV4();

const TPLINK_USER = process.env.TPLINK_USER ;
const TPLINK_PASS = process.env.TPLINK_PASS ;
const TPLINK_DEVICE = process.env.TPLINK_DEVICE ;

const DBHOST = process.env.DBHOST ;
const DBPORT = process.env.DBPORT ;
const DBUSER = process.env.DBUSER ;
const DBPWD = process.env.DBPWD ;
const DATABASE = process.env.DATABASE ;
const TABLE = process.env.TABLE ;
const POWER_LOW = process.env.POWER_LOW ;
const POWER_HIGH = process.env.POWER_HIGH ;
const LITERS_HOUR = process.env.LITERS_HOUR ;

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
  var date = new Date();
  dateS = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2) + ("00" + date.getMilliseconds()).slice(-3);
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
  values = dateS + ',' + powerMW + ',' + state;
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

}

main();


