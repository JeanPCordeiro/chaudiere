const mysql = require('mysql');

const DBHOST = process.env.DBHOST;
const DBPORT = process.env.DBPORT;
const DBUSER = process.env.DBUSER;
const DBPWD = process.env.DBPWD;
const DATABASE = process.env.DATABASE;
const TABLE = process.env.TABLE;
const LITERS_HOUR = process.env.LITERS_HOUR;

const POWER_BURN = 3;

var config =
{
  host: DBHOST,
  user: DBUSER,
  password: DBPWD,
  database: DATABASE,
  port: DBPORT,
};

const conn = new mysql.createConnection(config);

conn.connect(
  function (err) {
    if (err) {
      console.log("!!! Cannot connect !!! Error:");
      throw err;
    }
    else {
      console.log("Connection established.");
      readData();
    }
  });

function readData() {
  let lastDate = "";
  let DateDebut = "";
  let DateFin = "";
  let nb = 0;
  let ConsoJour = 0;
  let Armed = false;
  let RowDebut = 0;
  let RowFin = 0;
  let date = new Date();
  date.setDate(date.getDate() - 1);
  let dateS = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
  console.log(dateS);
  let sql = "SELECT * FROM " + TABLE + " WHERE TIME LIKE '" + dateS + "%'";
  conn.query(sql,
    function (err, results, fields) {
      if (err) throw err;
      else console.log('Selected ' + results.length + ' row(s).');

      Object.keys(results).forEach(function (key) {
        var row = results[key];
        //console.log(row.date, row.powermw,row.state);
        nb++;
        if (row.state == POWER_BURN) {
          if (!Armed) {
            DateDebut = row.date;
            RowDebut = nb;
          }
          Armed = true;
        } else {
          if (Armed) {
            DateFin = row.date;
            RowFin = nb;
            NewDateDebut = (parseInt(DateDebut.substring(8, 10)) * 3600 + parseInt(DateDebut.substring(10, 12)) * 60 + parseInt(DateDebut.substring(12, 14))) * 1000 + parseInt(DateDebut.substring(14, 17));
            NewDateFin = (parseInt(DateFin.substring(8, 10)) * 3600 + parseInt(DateFin.substring(10, 12)) * 60 + parseInt(DateFin.substring(12, 14))) * 1000 + parseInt(DateFin.substring(14, 17));
            Delta = NewDateFin - NewDateDebut;
            ConsoJour += LITERS_HOUR / 60 / 60 / 1000 * Delta;
            console.log(DateDebut, DateFin, RowDebut, RowFin, RowFin - RowDebut, Delta, ConsoJour);
          }
          Armed = false;
        }
        lastDate = row.date;
      });
      console.log('Done.');
      if (Armed) {
        console.log("QUEUE");
        DateFin = lastDate;
        RowFin = nb;
        NewDateDebut = (parseInt(DateDebut.substring(8, 10)) * 3600 + parseInt(DateDebut.substring(10, 12)) * 60 + parseInt(DateDebut.substring(12, 14))) * 1000 + parseInt(DateDebut.substring(14, 17));
        NewDateFin = (parseInt(DateFin.substring(8, 10)) * 3600 + parseInt(DateFin.substring(10, 12)) * 60 + parseInt(DateFin.substring(12, 14))) * 1000 + parseInt(DateFin.substring(14, 17));
        Delta = NewDateFin - NewDateDebut;
        ConsoJour += LITERS_HOUR / 60 / 60 / 1000 * Delta;
        console.log(DateDebut, DateFin, RowDebut, RowFin, RowFin - RowDebut, Delta, ConsoJour);
      }

      console.log(nb, ConsoJour);
    })
  conn.end(
    function (err) {
      if (err) throw err;
      else console.log('Closing connection.')
    });
};
