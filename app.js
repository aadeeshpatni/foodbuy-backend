const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.use(bodyParser.json({extended: true}));


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


const dispatchDetails = {
    isDispatched: Boolean,
    dispatchTime: Number
}
const deliveryDetails = {
    isDelivered: Boolean,
    deliveryTime: Number
}
const orderSchema = new mongoose.Schema({
    buyerId: String,
    productId: String,
    orderedQuantity: Number,
    time: Number,
    cost: Number,
    dispatch: dispatchDetails,
    delivery: deliveryDetails
});
const Order = mongoose.model("Order", orderSchema);


//path: url/users?userType=customer
app.post("/users", function(req, res) {
    console.log("body: " + JSON.stringify(req.body));
    const userType = req.query.userType;
    const newUser = new User(req.body);
    newUser.userType = userType;

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


app.post("/products", function(req, res) {
    console.log("body: " + JSON.stringify(req.body));

    const newProduct = new Product(req.body);
    newProduct.save(function(err) {
        if(err) {
            const responseObject = {
                error: true,
                message: err
            }
            console.log(err);
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
    console.log("body: " + JSON.stringify(req.body));
    const productId = req.query.productId;
    const update = req.body;
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


//path: url/placeOrder
/*
    request body: 
    {
        buyerId: String,
        productId: String,
        productQuantity: Float
    }
*/
app.post("/placeOrder", function(req, res) {
    console.log(JSON.stringify(req.body));
    User.findById(req.body.buyerId, function(err, buyer) {
        if(err || !buyer) {
            console.log(err);
            res.send({
                error: true,
                message: "could not find buyer, order not placed",
                order: null
            });
        }
        else{
            console.log(JSON.stringify(buyer));
            Product.findById(req.body.productId, function(err, orderedProduct) {
                if(err || !orderedProduct) {
                    console.log(err);
                    res.send({
                        error: true,
                        message: "could not find product, order not placed",
                        order: null
                    });
                }
                else {
                    console.log(JSON.stringify(orderedProduct));
                    console.log("orderedQ: " + req.body.productQuantity);
                    if(orderedProduct.quantity >= req.body.productQuantity) {
                        const newQuantity = orderedProduct.quantity - req.body.productQuantity;
                        Product.findByIdAndUpdate(
                            orderedProduct._id,
                            {quantity: newQuantity},
                            {new: true},
                            function(err, updatedProduct) {
                                if(err) {
                                    console.log(err);
                                    res.send({
                                        error: true,
                                        message: "could not update product, order not placed",
                                        order: null
                                    });
                                }
                                else{
                                    console.log(JSON.stringify(updatedProduct));
                                    const orderCost = req.body.productQuantity * updatedProduct.price;
                                    const newOrder = new Order({
                                        buyerId: buyer._id,
                                        productId: updatedProduct._id,
                                        orderedQuantity: req.body.productQuantity,
                                        time: Date.now(),
                                        cost: orderCost,
                                        dispatch: {
                                            isDispatched: false,
                                            dispatchTime: 0.0
                                        },
                                        delivery: {
                                            isDelivered: false,
                                            deliveryTime: 0.0
                                        }
                                    });
                                    newOrder.save(function(err) {
                                        if(err) {
                                            console.log(err);
                                            res.send({
                                                error: true,
                                                message: "error placing order",
                                                order: null
                                            });
                                        }
                                        else {
                                            res.send({
                                                error: false,
                                                message: "order placed successfully",
                                                order: newOrder
                                            });
                                        }
                                    });
                                }
                            } 
                        )
                    } else {
                        res.send({
                            error: true,
                            message: "could not place order, ordered quantity is not available",
                            order: null
                        });
                    }
                }
            })
        }
    })
})


//path: url/products?productName=[name of the product typed by the user]&userType=[user type who is searching, can be 'retailer' or 'customer']
app.get("/products", function(req, res) {
    const productName = req.query.productName;
    const userType = req.query.userType;

    console.log("queries: " + productName + " " + userType);

    const sellerType = (userType === "customer") ? "retailer" : "wholesaler";
    Product.find(
        {
            name: {$regex: productName, $options: "i"}, 
            sellerType: sellerType
        },
        function(err, foundProducts) {
            if(err) {
                console.log(err);
                const responseObject = {
                    error: true,
                    message: err,
                    products: null
                }
                res.send(responseObject);
            } else {
                if(foundProducts.length > 0) {
                    const responseObject = {
                        error: false,
                        message: "found products successfully",
                        products: foundProducts
                    }
                    res.send(responseObject);
                }
                else {
                    const responseObject = {
                        error: false,
                        message: "no matching products found",
                        products: null
                    }
                    res.send(responseObject);
                }
            }
        }
    )
});


//path: url/orders?buyerId=[_id of the user]
app.get("/orders", function(req, res) {
    console.log("buyerId: " + req.query.buyerId);
    Order.find({buyerId: req.query.buyerId}, function(err, foundOrders) {
        if(err) {
            console.log(err);
            res.send({
                error: true,
                message: "error finding your orders",
                orders: null
            });
        }
        else {
            if(foundOrders.length > 0) {

                const correspondingProducts = [];
                foundOrders.forEach(function(order, index) {
                    Product.findById(order.productId, function(err, foundProduct) {
                        if(err) {
                            console.log(err);
                            res.send({
                                error: true,
                                message: "error finding your order's product",
                                orders: null
                            });
                        }
                        else {
                            correspondingProducts.push(foundProduct);
                            console.log(foundProduct);
                            if(index === foundOrders.length-1) {
                                res.send({
                                    error: false,
                                    message: "found orders successfully",
                                    orders: foundOrders,
                                    products: correspondingProducts
                                });
                            }
                        }
                    })
                });
                
            } else {
                res.send({
                    error: false,
                    message: "you have no orders currently",
                    orders: null
                });
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