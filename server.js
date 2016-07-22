var PORT          = process.env.PORT || 3000;

var express       = require('express'),
    cors          = require('cors'),
    bodyParser    = require('body-parser'),
    mongodb       = require('mongodb'),
    request       = require('request'),
    app           = express(),
    colors        = require('colors'),
    AYLIENTextAPI = require('aylien_textapi');

/* adds the ability ajax to our server from anywhere! */
app.use(cors());

/* extended:true = put it in an obj */
app.use(bodyParser.urlencoded({extended: true}));

/* MongoClient lets us interface/connect to mongodb */
var MongoClient = mongodb.MongoClient;

/* Connection url where your mongodb server is running. */
var mongoUrl = 'mongodb://localhost:27017/notes';

/* welcome page */
app.get('/', function(request, response){
  response.json({"description":"Welcome to the productivity app"});
});

/* see all */
app.get('/entries', function(request, response){
  MongoClient.connect(mongoUrl, function (err, db) {
    var entriesCollection = db.collection('entries');
    if (err) {
      console.log('Unable to connect to the mongoDB server. ERROR:', err);
    } else {
      /* Get all */
      entriesCollection.find().toArray(function (err, result) {
        if (err) {
          console.log("ERROR!", err);
          response.json("error");
        } else if (result.length) {
          console.log('Found:', result);
          response.json(result);
        } else { //
          console.log('No document(s) found with defined "find" criteria');
          response.json("none found");
        }
        db.close(function() {
          console.log( "database CLOSED");
        });
      }); // end find

    } // end else
  }); // end mongo connect
}); // end get all


/*new post*/
app.post('/entries/new', function(request, response){
  // response.json({"description":"add new"});
  console.log("request.body", request.body);

  MongoClient.connect(mongoUrl, function (err, db) {
    var entriesCollection = db.collection('entries');
    if (err) {
      console.log('Unable to connect to the mongoDB server. ERROR:', err);
    } else {
      // We are connected!
      console.log('Connection established to', mongoUrl);
      console.log('Adding new entry...');
/* insert*/
      var newEntry = request.body;
      console.log(newEntry,'request.body');
      entriesCollection.insert([newEntry], function (err, result) {
        if (err) {
          console.log(err);
          response.json("error");
        } else {
          console.log('Inserted.');
          console.log('RESULT!!!!', result);
          console.log("end result");
          response.json(result);
        }
        db.close(function() {
          console.log( "database CLOSED");
        });
      }); // end insert
    } // end else
  }); // end mongo connect
}); // end add new

  /* tell our app where to listen */
  app.listen(3000, function(){
    console.log('listen to events on a "port".')
  });
