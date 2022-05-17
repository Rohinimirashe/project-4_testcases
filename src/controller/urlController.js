const urlModel = require("../model/urlModel");

const createUrl = async function (req, res) {
    try {
       
        let requestBody = req.body
        
        const urlData = { };
        const saveUrl = await urlModel.create(urlData)
        

  

        return res.status(201).send({ status: true, message: "Success", data: saveUrl })

    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }

}
module.exports = { createUrl}
