const urlModel = require('../model/urlModel')
const validUrl = require('valid-url');
const shortId = require('shortid')

const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    15955,
    "redis-15955.c11.us-east-1-2.ec2.cloud.redislabs.com", { no_ready_check: true }
);
redisClient.auth("Ow05Y9rZBrQ6Pyo0svkD3nt4JUEyVCx2", function(err) {
    if (err) throw err;
});

redisClient.on("connect", async function() {
    console.log("Connected to Redis.......");
});


//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const isValid = (a) => {
    if (typeof a === "undefined" || typeof a === "null") return false;
    if (typeof a === "string" && a.trim().length === 0) return false;
    return true;
};


let createUrl = async(req, res) => {

    try {
        let data = req.body


        // validation for request body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Invalid Url please provide valid details" })
        }

        // validation for longUrl
        const { longUrl } = data;

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "Please give the long URL" })
        }

        if (!validUrl.isWebUri(longUrl.trim())) {
            return res.status(400).send({ status: false, message: "please enter a valid long url" })
        }

        // to check longUrl present in chache or not
        let cahcedUrl = await GET_ASYNC(`${longUrl}`)
        let getUrl = JSON.parse(cahcedUrl)
        if (cahcedUrl) {
            return res.status(201).send({ status: true, data: getUrl })
        }

        // to check longUrl present in db or not
        let url = await urlModel.findOne({ longUrl: data.longUrl })
        if (url) {
            return res.status(400).send({ status: false, message: "url is alredy present in db" })
        }

        const baseUrl = 'http://localhost:3000'
        let urlCode = shortId.generate().toLowerCase();

        // structure of shortUrl
        const shortUrl = baseUrl + '/' + urlCode;

        data.urlCode = urlCode;
        data.shortUrl = shortUrl;


        // to create document
        await urlModel.create(data)
        let bodyData = await urlModel.findOne({ urlCode: urlCode }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
        await SET_ASYNC(`${longUrl}`, JSON.stringify(bodyData))
        res.status(201).send({ status: true, message: "URL create successfully", data: bodyData })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })

    }
}





let getUrl = async(req, res) => {

    try {
        let urlCode = req.params.urlCode;

        //if url is in invalid formate
        if (!shortId.isValid(urlCode)) {
            return res
                .status(400)
                .send({ status: false, message: "Not a valid url code" });
        }

        //to check if url code is in cache memory or not
        let cahcedUrlData = await GET_ASYNC(`${urlCode}`)
        if (cahcedUrlData) {
            return res.status(302).redirect(JSON.parse(cahcedUrlData))
        } else {

            // to check if url code is in database or not
            let getUrl = await urlModel.findOne({ urlCode: urlCode })
            if (!getUrl) return res.status(404).send({ status: false, message: 'shortUrl not found' });

            await SET_ASYNC(`${urlCode}`, JSON.stringify(getUrl.longUrl))
            return res.status(302).redirect(getUrl.longUrl)

        }
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}


module.exports = { createUrl, getUrl }