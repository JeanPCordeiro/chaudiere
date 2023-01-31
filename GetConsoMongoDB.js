const { login } = require('tplink-cloud-api');
const { v4: uuidv4 } = require('uuid');
var mongoose = require('mongoose');

const TPLINK_TERM = uuidv4();

const TPLINK_USER = process.env.TPLINK_USER;
const TPLINK_PASS = process.env.TPLINK_PASS;
const TPLINK_DEVICE = process.env.TPLINK_DEVICE;

const DBHOST = process.env.DBHOST;
const DBPORT = process.env.DBPORT;
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
  var date = new Date();
  dateS = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2) + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2) + ("00" + date.getMilliseconds()).slice(-3);
  switch (true) {
    case (powerMW == 0):
      state = POWER_OFF;
      break;
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
 
  duree = Date.now() - entree;
  console.log(values, duree);

  // make a connection 
  mongoose.set('strictQuery', false);
  mongoose.connect('mongodb://'+DBHOST+':'+DBPORT+'/'+DATABASE);
  // get reference to database
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log("Connection Successful to HOST(",DBHOST,") PORT(",DBPORT,") DATABASE(",DATABASE,")");
    // define Schema
    var PowerSchema = mongoose.Schema({
      date: String,
      powerMW: Number,
      state: Number
    });
    // compile schema to model
    var Power = mongoose.model('Power', PowerSchema, TABLE);
    // documents array
    var data = { date: dateS, powerMW: powerMW, state: state };
    // save multiple documents to the collection referenced by Book Model
    Power.collection.insertOne(data, function (err, docs) {
      if (err){ 
          return console.error(err);
      } else {
        console.log("Document",data,"inserted to Collection");
        mongoose.disconnect();
      }
    });
  }); 
}

main();


