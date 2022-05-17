const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const mongoose  = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://Rohini123:Rohini%4012345@cluster0.dggci.mongodb.net/group-15-Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});