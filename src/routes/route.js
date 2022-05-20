// express is an server-side web framework for node.js which execute our code on the web
const express = require('express');
const router = express.Router(); //used express to create route handlers

//import controller
const { createUrl, getUrl } = require("../controller/urlController")


router.post('/url/shorten', createUrl);
router.get('/:urlCode', getUrl);

module.exports = router;