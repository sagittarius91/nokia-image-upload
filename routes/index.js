'use strict'
var express = require('express')
var router = express.Router()

router.get('/',function(req,res){
    res.send("You are at home route")
})

module.exports = router
