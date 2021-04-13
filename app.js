const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));


//creating or connecting to foodbuyDB
mongoose.connect(
    //"mongodb://localhost:27017/foodbuyDB",
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

const descriptionSchema = new mongoose.Schema({
    type: String,
    subType: String,
    text: String
});
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number,
    unit: String,
    sellerType: String,
    description: descriptionSchema,
    seller: userSchema
});
const Product = mongoose.model("Product", productSchema);

//path: url/users?userType=customer
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
                message: "user saved successfully",
                user: newUser
            }
            res.send(responseObject);
        }
    });
});

//path: url/users?email=abcd@ab.com
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
});


app.get("/products", function(req, res) {
    Product.find({}, function(err, foundProducts) {
        if(err) {
            const responseObject = {
                error: true,
                message: err
            }
            res.send(responseObject);
        } else {
            const responseObject = {
                error: false,
                products: foundProducts
            }
            res.send(responseObject);
        }
    })
});

app.post("/products", function(req, res) {
    const newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        unit: req.body.unit,
        sellerType: req.body.sellerType,
        description: req.body.description,
        seller: req.body.seller
    });
    newProduct.save(function(err) {
        if(err) {
            const responseObject = {
                error: true,
                message: err
            }
            res.send(responseObject);
        } else {
            const responseObject = {
                error: false,
                message: "product added successfully",
                product: newProduct
            }
            res.send(responseObject);
        }
    });
});

//path: url/products?productId=[_id of product]
app.patch("/products", function(req, res) {
    const productId = req.query.productId;
    const update = req.body.update;
    Product.findOneAndUpdate({_id: productId}, update, {new: true}, function(err, updatedProduct) {
        if(err) {
            const responseObject = {
                error: true,
                message: err
            }
            res.send(responseObject);
        } else {
            const responseObject = {
                error: false,
                message: "product updated successfully",
                product: updatedProduct
            }
            res.send(responseObject);
        }
    });
});



let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started successfully");
});