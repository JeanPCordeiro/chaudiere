FROM node:buster
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY getconsoSql.js .
CMD [ "node", "getconsoSql.js" ]
