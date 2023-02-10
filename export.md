
```bash

export TPLINK_USER=tplinkusermail
export TPLINK_PASS=tplinkpass
export TPLINK_DEVICE=Chaudiere

export DBHOST=127.0.0.1
export DBPORT=3306
export DBUSER=root
export DBPWD= 
export DATABASE=Boiler
export TABLE=Boiler

docker stop mysql
docker rm mysql
docker run -d -p 3306:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=yes mysql:5.7 --name mysql

docker exec -it mysql mysql


    CREATE DATABASE IF NOT EXISTS Boiler;
    USE Boiler;
    CREATE TABLE Boiler ( time timestamp, powerMW int, state int );

```