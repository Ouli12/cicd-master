require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const server = express();

server.use(bodyParser.urlencoded());
server.use(bodyParser.json());

const hostname = "127.0.0.1";
const port = process.env.PORT || 4000;
const DB_TABLE = process.env.DB_TABLE;

/**
 * Remote DB access credentials
 */
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const remote_uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@clusterdb.usmas.azure.mongodb.net/${DB_TABLE}?retryWrites=true&w=majority`;

/**
 * Local DB access credentials
 */
// const local_uri = `mongodb://localhost/${DB_TABLE}"`

/**
 * Connect Back-end application to MongoDB Database
 * DbName = "db-nodeproject"
 */
mongoose
  // Connect to DB in local
  /* .connect(local_uri, { useNewUrlParser: true, useUnifiedTopology: true }) */

  // Connect to DB in remote
  .connect(remote_uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log("Not Connected to Database ERROR! ", err);
  });

const schoolRoute = require("./api/routes/schoolRoute");
schoolRoute(server);
const groupRoute = require("./api/routes/groupRoute");
groupRoute(server);
const userRoute = require("./api/routes/userRoute");
userRoute(server);
const questionsRoute = require("./api/routes/questionsRoute");
questionsRoute(server);
// const memberRoute = require("./api/routes/memberRoute");
// memberRoute(server);

server.listen(port, hostname);