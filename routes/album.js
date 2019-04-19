'use strict'
var express = require('express')
var router = express.Router()
var multer = require('multer')
var fs = require('fs')
var dbConnect = require('../dao/dbConnect.js')
var dbConnectObj = new dbConnect()
const path = require("path");
var storage = multer.diskStorage({
    destination: function(req, file, cb){
       console.log("*****************************", req.body.name)
       let destination = process.env.images_folder+req.body.name+"/";
       if(! fs.existsSync(destination)){
	    fs.mkdirSync(destination);
	    cb(null, destination);
       } else {
	    cb(null, destination);
       }
    },
    //destination: process.env.images_folder,
    //destination: process.env.images_folder+"testCollection/",
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({
    storage: storage
});

const { createLogger, format, transports } = require('winston');
const logger = createLogger({
  level: 'debug',
  format: format.simple(),
  transports: [new transports.Console()]
});

/**
 * @swagger
 * /image:
 *   post:
 *     tags:
 *       - Album
 *     description: Create an album
 *     produces:
 *       - application/json
 *     parameters:
 *       - albumName: albumName
 *         description: Album to be created
 *         required: true
 *         in: body
 *     responses:
 *       200:
 *         description: Delete an album
 */


router.post('/', function(req, res) {
    var name = req.body.name
    dbConnectObj.addAlbum(name, function(err, result) {
        if (err) {
            logger.info("Got error while creating album", err)
            res.json({
                message:"Got error while creating album", err,
                error: err
	    })
        } else {
            logger.info("Result from db ",result)
            res.json({
                message:"Successfully posted album",
                response: result
            })
        }
    })
})

/**
 * @swagger
 * /image:
 *   post:
 *     tags:
 *       - Album
 *     description: Post image in album
 *     produces:
 *       - application/json
 *     parameters:
 *       - image: image
 *         description: Image to be uploaded
 *         required: true
 *         in: body
 *     responses:
 *       200:
 *         description: Delete an album
 */

router.post('/image', upload.single('image'), function(req, res) {
    var obj = {
        "dest": process.env.images_folder+req.body.name,
        "name": req.file.originalname,
        "album": req.body.name
    }
    dbConnectObj.addImage(obj, function(err, result) {
        if (err) {
            logger.info("Got error while adding image", err)
            res.json({
                 message:"Got error while adding image",
                 error: err
            })
        } else {
            logger.info("Result from db while adding image", result)
            res.json({
                 message: "Successfully added image in album",
                 response: result
            })
        }
    })
})

/**
 * @swagger
 * /{albumName}:
 *   delete:
 *     tags:
 *       - Album
 *     description: Delete an album
 *     produces:
 *       - application/json
 *     parameters:
 *       - albumName: albumName
 *         description: Name of the album to be deleted
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Delete an album
 */


router.delete('/:albumName', function(req, res) {
    logger.info("Album name:", req.params)
    dbConnectObj.deleteAlbum(req.params.albumName, function(err, result) {
        if (err) {
            logger.info("Got error while deleting album", err)
            res.json({
                message: "Got error while deleting album",
                error:err
	    })
        } else {
            logger.info("Album deleted ")
            res.json({
               message: "Album deleted",
               reponse: result
            })
        }
    })
})

/**
 * @swagger
 * /{albumName}/{imageName}:
 *   delete:
 *     tags:
 *       - Album
 *     description: Delete image from an album
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Delete image from album
 */


router.delete('/:albumName/:imageName', function(req, res) {
    console.log("Album name and image name", req.params)
    dbConnectObj.deleteImage(req.params, function(err, result) {
        if (err) {
            logger.info("Got error while deleting image", err)
            res.json({
                message: "Got error while deleting image",
                error:err
            })
        } else {
            logger.info("Image deleted")
            res.json({
                 message: "Image deleted",
                 reponse: result
            })
        }
    })
})
/**
 * @swagger
 * /album/{imageName}:
 *   get:
 *     tags:
 *       - Album
 *     description: Returns image from an album
 *     produces:
 *       - image/jpg
 *     responses:
 *       200:
 *         description: An image from album
 */

router.get('/:albumName/:id', function(req, res) {
    dbConnectObj.getImagePath(req.params, function(err, result) {
        if (err) {
            logger.info("Got error while getting image path")
            res.json({
                message:"Got error while getting image path",
                error:err
            })
        } else {
            logger.info("Result from db while getting image", result)
            dbConnectObj.getImage(result, function(er, re) {
                if (err) {
                    logger.info("Got error while getting image", er)
                } else {
                    res.writeHead(200, {
                        'Content-type': 'image/jpg'
                    });
                    res.end(re);
                }
            })
        }
    })
})

router.get('/:albumName', function(req, res) {
    dbConnectObj.getAllImages(req.params, function(err, result) {
        if (err) {
            logger.info("Got error while getting all images")
            res.json({
                message:"Got error while getting all images",
                error:err
            })
        } else {
            logger.info("Result from db while getting all images", result)
            res.json({
                message: "all images",
                response: result
            })
        }
    })
})


router.get('/', function(req, res) {
    res.send("Inside get album")
})

module.exports = router
