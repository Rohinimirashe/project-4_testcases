const urlModel = require('../model/urlModel')
const validUrl = require('valid-url');
const shortId = require('shortid')  
const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  16134,
  "redis-16134.c212.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("luKhXEybyJGwsvCRNQVnqECWfiU6l9Ex", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


let createUrl = async (req, res) => {

    try {
        let data= req.body
    
        if(Object.keys(data).length == 0){
            return res.status(400).send({status:false, message:"Invalid Url please provide valid details"})
        }
    
        if(!data.longUrl){
            return res.status(400).send({status:false, message:"Please give the long URL"})
        }
    
        if(!validUrl.isUri(data.longUrl)){
            return res.status(400).send({status:false, message:"please enter a valid long url"})
        }
    
        let url= await urlModel.findOne({longUrl: data.longUrl})
        if(url){
            return res.status(409).send({status:false, message:"url is alredy present in db"})
        }
    
        const baseUrl = 'http://localhost:3000'
        let urlCode = shortId.generate().toLowerCase();
        const shortUrl= baseUrl+ '/'+ urlCode;
    
        data.urlCode=urlCode;
        data.shortUrl=shortUrl;

        //data[urlCode]=urlCode
    
        await urlModel.create(data)
        let bodyData =await urlModel.findOne({urlCode:urlCode}).select({_id:0, __v:0, createdAt:0, updatedAt:0})
    
        res.status(201).send({status:true, message:"URL create successfully", data:bodyData})    
      } catch (err) {
        res.status(500).send({status:false, message:err.message})
          
      }
    }
    const fetchAuthorProfile = async function (req, res) {
      let cahcedProfileData = await GET_ASYNC(`${req.params.authorId}`)
      if(cahcedProfileData) {
        res.send(cahcedProfileData)
      } else {
        let profile = await authorModel.findById(req.params.authorId);
        await SET_ASYNC(`${req.params.authorId}`, JSON.stringify(profile))
        res.send({ data: profile });
      }
    
    };


let getUrl = async (req, res) => {

    try {
        let urlCode = req.params.urlCode;
    
        let getUrl = await urlModel.findOne({ urlCode: urlCode })
        if(!getUrl) return res.status(404).send({ status: false, message: 'Url-code not found' });

        res.status(303).redirect(getUrl.longUrl)
      } catch (err) {
        res.status(500).send({ status: false, error: err.message });
      }
    }

module.exports = { createUrl, getUrl}