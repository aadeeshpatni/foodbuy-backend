const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");
const { response } = require("express");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));


//creating or connecting to foodbuyDB
mongoose.connect(
    "mongodb+srv://admin-aadeesh:test123@cluster0.fks0o.mongodb.net/foodbuyDB", 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useFindAndModify: false
    }
);


//used for users
const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    userType: String,
    storeName: String,
    address: {
        street: String,
        pincode: String,
        city: String,
        state: String
    },
    phone: String
});
//makes a 'users' collection on foodbuyDB
const User = mongoose.model("User", userSchema);


app.post("/users", function(req, res) {
    const userType = req.query.userType;
    const newUser = new User({
        email: req.body.email,
        name: req.body.name,
        userType: userType,
        storeName: req.body.storeName,
        address: {
            street: req.body.street,
            pincode: req.body.pincode,
            city: req.body.city,
            state: req.body.state
        },
        phone: req.body.phone
    });

    newUser.save(function(err) {
        if(err) {
            console.log(err);
            const responseObject = {
                error: true,
                message: err
            }
            res.send(responseObject);
        } else {
            const responseObject = {
                error: false,
                message: "user saved successfully"
            }
            res.send(responseObject);
        }
    });
});


//users?email=abcd@ab.com
app.get("/users", function(req, res) {
    const userEmail = req.query.email;
    let responseObject = {
        error: false,
        message: "no user found",
        userType: "",
        user: null
    }
    
    User.findOne({email: userEmail}, function(err, foundUser) {
        if(err) {
            console.log(err);
            const responseObject = {
                error: true,
                message: err
            }
            res.send(responseObject);
        } else {
            if(foundUser) {
                const responseObject = {
                    error: false,
                    message: "user found successfully",
                    user: foundUser
                }
                res.send(responseObject);
            } else {
                const responseObject = {
                    error: false,
                    message: "user not found",
                    user: foundUser
                }
                res.send(responseObject);
            }
        }
    })
})




let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started successfully");
});