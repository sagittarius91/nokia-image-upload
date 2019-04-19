var MongoClient = require('mongodb').MongoClient
var mongourl = 'mongodb://' + process.env.mongo_service + ':' + process.env.mongo_port
var fs = require('fs')
var mqtt = require('mqtt'),
    url = require('url')
var url = "mqtt://" + process.env.mqtt_service;
const { createLogger, format, transports } = require('winston');
const logger = createLogger({
  level: 'debug',
  format: format.simple(),
  transports: [new transports.Console()]
});



function dbConnect() {
    logger.info("NOKIA CHALLENGE")
}

dbConnect.prototype.addAlbum = function(args, done) {
    MongoClient.connect(mongourl, function(err, db) {
        if (err) {
            logger.info("Got error while connecting db", err)
            done(err,null)
        } else {
            logger.info("DB Connected")
            var dbObject = db.db(process.env.mongo_database);
            dbObject.createCollection(args, function(err, res) {
                if (err) {
                    logger.info("Error while creating collection", err)
                    done(err, null)
                } else {
                    logger.info("Collection created")
                    db.close()
                    done(null, "Collection created in db")
                }
            })
        }
    })
}

dbConnect.prototype.addImage = function(args, done) {
	var self = this
    var imageLocation = args.dest
    var myObj = {
        "_id": args.name,
        Image_Location: imageLocation,
        Image_Name: args.name
    }
    MongoClient.connect(mongourl, function(err, db) {
        if (err) {
            logger.info("Got error while connecting to db", err)
            done(err,null)
        } else {
            console.log("Connected")
            var dbObject = db.db(process.env.mongo_database)
            logger.info("Args for addImage ", args)
            dbObject.collection(args.album).insertOne(myObj, function(err, res) {
                if (err) {
                    logger.info("Error while saving image location", err)
					self.mqttPush("Error while saving image location "+err,function(mqttErr,response){
						done(err,null)
					})
                } else {
                    logger.info("Image location saved")
					self.mqttPush("Image location saved in "+imageLocation,function(mqttErr,reponse){
						 db.close()
						done(null, "Image location saved in db")
					})
                }
            })
        }
    })
}

dbConnect.prototype.getImagePath = function(args, done) {
    MongoClient.connect(mongourl, function(err, db) {
        if (err) {
            logger.info("Got error while connecting to db", err)
            done(err,null)
        } else {
            logger.info("Connected")
            var dbObject = db.db(process.env.mongo_database)
            logger.info("Args for getImage ", args)
            var query = {
                "_id": args.id
            };
            dbObject.collection(args.albumName).find(query).toArray(function(err, result) {
                if (err) {
                    logger.info("Error while getting image location", err)
                    done(err, null)
                } else {
                    logger.info("Image location retrieved")
                    db.close()
                    done(null, result)
                }
            })
        }
    })
}

dbConnect.prototype.getImage = function(args, done) {
    var imagePath = args[0].Image_Location+"/"+args[0]._id
    fs.readFile(imagePath, function(err, content) {
        if (err) {
            logger.info(err);
            done(err, null)
        } else {
            done(null, content);
        }
    });
}

dbConnect.prototype.getAllImages = function(args, done) {
    MongoClient.connect(mongourl, function(err, db) {
        if (err) {
            logger.info("Got error while connecting to db", err)
            done(err,null)
        } else {
            logger.info("Connected")
            var dbObject = db.db(process.env.mongo_database)
            logger.info("Args for getImage ", args)
            
            dbObject.collection(args.albumName).find({}).toArray(function(err, result) {
                if (err) {
                    logger.info("Error while getting image location", err)
                    done(err, null)
                } else {
					var imagesLocation = []
                    logger.info("Image locations retrieved")
					for (var i of result) {
						imagesLocation.push(i.Image_Location+"/"+i._id)
					}
                    db.close()
                    done(null, imagesLocation)
                }
            })
        }
    })
}


dbConnect.prototype.deleteAlbum = function(args, done) {
    MongoClient.connect(mongourl, function(err, db) {
        if (err) {
            logger.info("Got error while connecting to db", err)
            done(err,null)
        } else {
            logger.info("Connected")
            var dbObject = db.db(process.env.mongo_database)
            logger.info("Args for delete album ", args)
            dbObject.collection(args).drop(function(err, result) {
                if (err) {
                    logger.info("Error while deleting collection", err)
                    done(err, null)
                } else {
                    logger.info("Successfully deleted collection", args)
                    db.close()
                    done(null, result)
                }
            })
        }
    })
}
dbConnect.prototype.deleteImage = function(args, done) {
    logger.info("Delete image in dbConnect. Args are ", args)
    this.mongoDelete(args, function(err, resp) {
        if (err) {
            done(err, null)
        } else {
            done(null, resp)
        }
    })
}

dbConnect.prototype.mqttPush = function(message, done) {
    logger.info("Called mqttpush")
    var options = {
        port: process.env.mqtt_port
    };

    // Create a client connection
    var client = mqtt.connect(url, options);
    client.on('connect', function() { // When connected
        logger.info("Connected to mqtt")
        // subscribe to a topic
        client.subscribe(process.env.mqtt_topic, function() {
            client.publish(process.env.mqtt_topic, message, function() {
                logger.info("Message is published");
                client.end();
                done(null, "success")
            });
        });
    });
}

dbConnect.prototype.mongoDelete = function(args, done) {
    logger.info("called mongo delete")
    var albumName = args.albumName
    var imageName = args.imageName
    var self = this;
    MongoClient.connect(mongourl, function(err, db) {
        if (err) {
            logger.info("Got error while connecting to db", err)
            done(err,null)
        } else {
            logger.info("Connected")
            var dbObject = db.db(process.env.mongo_database)
            logger.info("Args for delete image ", args)
            var myquery = {
                "_id": imageName
            };
            dbObject.collection(albumName).deleteOne(myquery, function(err, result) {
                if (err) {
                    logger.info("Error while deleting image", err)
                    self.mqttPush("Error while deleting image "+err, function(errMqtt, response) {
                        done(err, null)
                    });
                } else {
                    logger.info("Successfully deleted image", args)
                    self.mqttPush("Successfully deleted image "+args, function(err, response) {
                        done(null, result)
                    })
                }
            })
        }
    })
}

module.exports = dbConnect

