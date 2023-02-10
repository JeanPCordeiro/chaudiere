const express = require('express')
const mysql = require('mysql');
var moment = require('moment');  

const DBHOST = process.env.DBHOST;
const DBPORT = process.env.DBPORT;
const DBUSER = process.env.DBUSER;
const DBPWD = process.env.DBPWD;
const DATABASE = process.env.DATABASE;
const TABLE = process.env.TABLE;
const LITERS_HOUR = 2.27125;
const POWER_BURN = 3;
const PORT = 3000;

var config =
{
  host: DBHOST,
  user: DBUSER,
  password: DBPWD,
  database: DATABASE,
  port: DBPORT,
};


const asyncHandler = (fun) => (req, res, next) => {
  Promise.resolve(fun(req, res, next))
    .catch(next)
}


const asyncFunc = (dateS) => {

    console.log("Date to search",dateS);
    let ConsoJour = 0;
    const conn = new mysql.createConnection(config);

    conn.connect(
      function (err) {
        if (err) {
          console.log("!!! Cannot connect MySQL !!! Error:");
          throw err;
        }
        else {
          console.log("Connection MySQL established.");

          ConsoJour = 0;
          let lastDate = "";
          let DateDebut = "";
          let DateFin = "";
          let nb = 0;
          let Armed = false;
          let RowDebut = 0;
          let RowFin = 0;

          let sql = "SELECT * FROM " + TABLE + " WHERE TIME LIKE '" + dateS + "%'";
          conn.query(sql,
            function (err, results, fields) {
              if (err) throw err;
              else console.log('Selected ' + results.length + ' row(s).');
        
              Object.keys(results).forEach(function (key) {
                var row = results[key];

                nb++;
                if (row.state == POWER_BURN) {
                  if (!Armed) {
                    DateDebut = moment(row.time).format('YYYY-MM-DD HH:mm:ss');
                    RowDebut = nb;
                  }
                  Armed = true;
                } else {
                  if (Armed) {
                    DateFin = moment(row.time).format('YYYY-MM-DD HH:mm:ss');
                    RowFin = nb;
                    NewDateDebut = (parseInt(DateDebut.substring(11, 13)) * 3600 + parseInt(DateDebut.substring(14, 16)) * 60 + parseInt(DateDebut.substring(17, 19))) ;
                    NewDateFin = (parseInt(DateFin.substring(11, 13)) * 3600 + parseInt(DateFin.substring(14, 16)) * 60 + parseInt(DateFin.substring(17, 19))) ;
                    Delta = NewDateFin - NewDateDebut;
                    ConsoJour += LITERS_HOUR / 60 / 60  * Delta;
                  }
                  Armed = false;
                }
                lastDate =  moment(row.time).format('YYYY-MM-DD HH:mm:ss');
              });
              if (Armed) {
                DateFin = lastDate;
                RowFin = nb;
                NewDateDebut = (parseInt(DateDebut.substring(11, 13)) * 3600 + parseInt(DateDebut.substring(14, 16)) * 60 + parseInt(DateDebut.substring(17, 19))) ;
                NewDateFin = (parseInt(DateFin.substring(11, 13)) * 3600 + parseInt(DateFin.substring(14, 16)) * 60 + parseInt(DateFin.substring(17, 19))) ;
                Delta = NewDateFin - NewDateDebut;
                ConsoJour += LITERS_HOUR / 60 / 60  * Delta;
              }

            })
       

          conn.end(
            function (err) {
              if (err) throw err;
              else { console.log('Closing MySQL connection.'); }
            });
           
        }

      });



  return new Promise((resolve) => {
    setTimeout(() => resolve(ConsoJour), 2000)
  })
}

const app = express();

app.get('/', asyncHandler(async (req, res) => {
  console.log("New request for date",req.query.date)
  const result1 = await asyncFunc(req.query.date)
  console.log("Conso for date",req.query.date,"is",result1)
  res.end(JSON.stringify({ Conso: result1 }));
}))

app.listen(PORT, () => console.log('Start listening on port',PORT))
