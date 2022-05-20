// express is an server-side web framework for node.js which execute our code on the web
const express = require('express');
// body parser is a middleware, used to process data sent through an HTTP request body
const bodyParser = require('body-parser');
const route = require('./routes/route.js'); //imported route
const mongoose = require('mongoose'); //ODM library for mongoDB
const app = express(); //Assign express in app variable

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// it helps to establish a connection b/w node and mongoDB
mongoose.connect("mongodb+srv://Rohini123:Rohini%4012345@cluster0.dggci.mongodb.net/group-15-Database", {
        useNewUrlParser: true
    })
    .then(() => console.log("MongoDb is connected")) //return fullfiled promise
    .catch(err => console.log(err)) //return rejected promise

app.use('/', route);

//port is two-way communication link between two programs running on the network
app.listen(process.env.PORT || 3000, function() {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});