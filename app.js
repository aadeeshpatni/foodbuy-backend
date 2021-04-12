const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));


//creating or connecting to foodbuyDB
mongoose.connect(
    "mongodb://localhost:27017/foodbuyDB", 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    }
);


//used for customers
const customerSchema = new mongoose.Schema({
    email: String,
    name: String,
    address: {
        street: String,
        pincode: String,
        city: String,
        state: String
    },
    phone: String
});
//makes a 'customers' collection on foodbuyDB
const Customer = mongoose.model("Customer", customerSchema);

//used for both retailers and wholesalers
const sellerSchema = new mongoose.Schema({
    email: String,
    name: String,
    storeName: String,
    address: {
        street: String,
        pincode: String,
        city: String,
        state: String
    },
    phone: String
});

const Retailer = mongoose.model("Retailer", sellerSchema);
const Wholesaler = mongoose.model("Wholesaler", sellerSchema);


//add new users in db
app.post("/customers", function(req, res) {
    //making a new customer object
    const newCustomer = new Customer({
        email: req.body.email,
        name: req.body.name,
        address: {
            street: req.body.street,
            pincode: req.body.pincode,
            city: req.body.city,
            state: req.body.state
        },
        phone: req.body.phone
    });

    //saving the new customer in 'customers' collection
    newCustomer.save(function(err) {
        if(!err) {
            const responseObject = {
                error: false,
                message: "User saved in db"
            }
            res.send(responseObject);
        } else {
            const responseObject = {
                error: true,
                message: "Error while saving in db"
            }
            res.send(responseObject);
        }
    })
});

app.post("/retailers", function(req, res) {
    const newRetailer = new Retailer({
        email: req.body.email,
        name: req.body.name,
        storeName: req.body.storeName,
        address: {
            street: req.body.street,
            pincode: req.body.pincode,
            city: req.body.city,
            state: req.body.state
        },
        phone: req.body.phone
    });

    newRetailer.save(function(err) {
        if(!err) {
            const responseObject = {
                error: false,
                message: "User saved in db"
            } 
            res.send(responseObject);
        } else {
            const responseObject = {
                error: true,
                message: "Error while saving in db"
            }
            res.send(responseObject);
        }
    });
});

app.post("/wholesalers", function(req, res) {
    const newWholesaler = new Wholesaler({
        email: req.body.email,
        name: req.body.name,
        storeName: req.body.storeName,
        address: {
            street: req.body.street,
            pincode: req.body.pincode,
            city: req.body.city,
            state: req.body.state
        },
        phone: req.body.phone
    });

    newWholesaler.save(function(err) {
        if(!err) {
            const responseObject = {
                error: false,
                message: "User saved in db"
            } 
            res.send(responseObject);
        } else {
            const responseObject = {
                error: true,
                message: "Error while saving in db"
            }
            res.send(responseObject);
        }
    });
});



app.listen(3000, function() {
    console.log("Server started on port 3000");
});