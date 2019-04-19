var express = require('express')
var path = require('path');
var app = express()
var bodyParser  = require('body-parser');
var routes = require('./routes/index');
var album = require('./routes/album');
var swaggerJSDoc = require('swagger-jsdoc')
const Prometheus = require('prom-client')
const { createLogger, format, transports } = require('winston');
const metricsInterval = Prometheus.collectDefaultMetrics()

const logger = createLogger({
  level: 'debug',
  format: format.simple(),
  transports: [new transports.Console()]
});

const httpRequestDurationMicroseconds = new Prometheus.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]  // buckets for response time from 0.1ms to 500ms
})

var swaggerDefinition = {
  info: {
    title: 'Node Swagger API',
    version: '1.0.0',
    description: 'Demonstrating how to describe a RESTful API with Swagger',
  },
  host: '{host}:{nodePort}',
  basePath: '/',
};
var options = {
    swaggerDefinition: swaggerDefinition,
    apis: ['./routes/*.js'],
    };
var swaggerSpec = swaggerJSDoc(options);

app.use((req, res, next) => {
  res.locals.startEpoch = Date.now()
  next()
})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

var myLogger = function (req, res, next) {
  console.log('LOGGED'+req.url)
  next()
}

app.use(myLogger)
app.use('/',routes)
app.use('/album',album)

app.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', Prometheus.register.contentType)
  res.end(Prometheus.register.metrics())
})

app.use(function(res,req,next){
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use(function(err,req,res,next){
  res.status(err.status || 500)
  res.json({
       message: err.message,
       error: err
  })
})
// Runs after each requests
app.use((req, res, next) => {
  const responseTimeInMs = Date.now() - res.locals.startEpoch

  httpRequestDurationMicroseconds
    .labels(req.method, req.route.path, res.statusCode)
    .observe(responseTimeInMs)

  next()
})
app.listen(3000)
