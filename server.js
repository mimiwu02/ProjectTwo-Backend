// var PORT          = process.env.PORT || 80
var PORT          = process.env.PORT || 3000;

var express       = require('express'),
    cors          = require('cors'),
    bodyParser    = require('body-parser'),
    mongodb       = require('mongodb'),
    request       = require('request'),
    app           = express(),
    colors        = require('colors'),
    AYLIENTextAPI = require('aylien_textapi');
    ObjectId = require('mongodb').ObjectId;

/* adds the ability ajax to our server from anywhere! */
app.use(cors());

/* extended:true = put it in an obj */
app.use(bodyParser.urlencoded({extended: true}));

/* MongoClient lets us interface/connect to mongodb */
var MongoClient = mongodb.MongoClient;

/* Connection url where your mongodb server is running. */
var mongoUrl = 'mongodb://localhost:27017/notes';
// var mongoUrl = 'mongodb://heroku_8npb49rs:60kb260mr8jj6k1t94149u13ts@ds027175.mlab.com:27175/heroku_8npb49rs'

// // initiate Aylien
// var textapi = new AYLIENTextAPI({
//   application_id: process.env.AYLIEN_API_ID,
//   application_key: process.env.AYLIEN_API_KEY
// });

/* welcome page */
app.get('/', function(request, response){
  response.json({"description":"Welcome to the productivity app"});
});

/***********************Part 2 Notes Page ************************/
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


/* delete */
app.delete('/entries/:id', function(request, response) {
  // response.json({"description":"delete by name"});

  console.log("request.body:", request.body);
  console.log("request.params:", request.params);

  MongoClient.connect(mongoUrl, function (err, db) {
    var entriesCollection = db.collection('entries');
    if (err) {
      console.log('Unable to connect to the mongoDB server. ERROR:', err);
    } else {
      // We are connected!
      console.log('Deleting by id... ');

      /* Delete */
      entriesCollection.remove({_id: new ObjectId(request.body.idNum)}, function(err, numOfRemovedDocs) {
        console.log("numOfRemovedDocs:", numOfRemovedDocs);
        if(err) {
          console.log("error!", err);
        } else { // after deletion, retrieve list of all
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
            }); //end db function
        }); // end find
      }; //end else
    }); // end remove
  } //end else
}); // end mongo connect

}); // end delete

/*************************Part 3 Weather ****************************/
/* weather endpoint welcome page */
app.get('/forecast', function(req, response) {
  //sends to FE & displays at localhost:3000
  response.json({"description" : "Open weather endpoint"});
  console.log("Weather");
}); //end welcome

/* location search by zip*/
app.post('/forecast/search', function(req, res){

  /*full query to open weather
  http://api.openweathermap.org/data/2.5/weather?zip=11228&APPID=
  */

  var baseUrl              = "http://api.openweathermap.org/data/2.5/weather";
  var endpoint             = '?zip=';
  var apiKeyQueryString    = '&APPID=';
  var OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;
  var queryString          = req.body.queryString;
  var fullQuery            = baseUrl + endpoint + queryString + apiKeyQueryString + OPEN_WEATHER_API_KEY;

  console.log("fullQuery:", fullQuery); //prints to terminal

  request({
    url: fullQuery,
    method: 'GET',
    callback: function(error, response, body) {
      res.send(body);
    }// end callback fxn
  }) //end request
}); //end post

/*************************Part 4 News ****************************/
app.get('/news', function(req, response) {
  //sends to FE & displays at localhost:3000
  response.json({"description" : "News endpoint"});
  console.log("news");
}); //end welcome

/* full query to get top headlines
 https://newsapi.org/v1/articles?source=techcrunch&sortBy=top&apiKey=
*/

/* get articles from different news sources*/
app.post('/news/articles', function(req, res) {
  var articlesEndpoint         = "https://newsapi.org/v1/articles";
  var sourceQuery              = '?source=';
  var newsFilter               = '&sortBy=top';
  var apiKeyNewsQueryString    = '&apiKey=';
  var queryString              = req.body.queryString;
  var NEWS_API_KEY             = process.env.NEWS_API_KEY;
  var fullSourceQuery          = articlesEndpoint + sourceQuery + queryString + newsFilter + apiKeyNewsQueryString + NEWS_API_KEY;

  console.log("fullSourceQuery:", fullSourceQuery); //prints to terminal

  request({
    url: fullSourceQuery,
    method: 'GET',
    callback: function(error, response, body) {
      res.send(body);
    } //end call back fxn
  }) //end request
}); //end post for sources



  /* tell our app where to listen */
  app.listen(PORT, function() {
    console.log('listen to events on a "port".')
  });
