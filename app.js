const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));



app.listen(3000, function() {
    console.log("Server started on port 3000");
});