/*
	hitdataexp
*/

var express      = require("express");
var app          = express();
var logger       = require("logging_component");
var url          = require("url");
/*
	MongoDB Based Security 
*/
var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var MongoStore   = require('connect-mongo')(session);
var MongoClient = require('mongodb').MongoClient;
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//MongoDB Connection Details
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/session');
var sessionStore = new MongoStore({mongooseConnection: mongoose.connection });
	
app.use(session({
    cookie: { maxAge: 1000*60*30 } ,
	//This is the Secret Key
    secret: "hitdataexp session secret code",
    store: sessionStore
}));

//Public Resources for Browser 
var path = __dirname + '/public/';
app.use('/resources', express.static(path + 'resources'));

//All URL Patterns Routing

app.get("/", function(req,res){
	if(null != req.session.name){
		res.redirect('/home');
	} else {
		res.redirect('/login');
	}
});

app.get("/login", function(req,res){
	if(null != req.session || undefined != req.session)
		req.session.destroy();
	res.sendFile(path + "login.html");
});	

app.get("/home", function(req,res){
	if(req.session.name == undefined)
		res.redirect('/login');
	else res.sendFile(path + "home.html");
});

app.get("/logout", function(req,res){
	res.redirect('/login');
});

var userValidatoin = function(user, callBackMethods){
	MongoClient.connect("mongodb://localhost:27017/userdata", function(err, db) {
		db.collection('users').findOne( user, function(err, result) {
			db.close();
			if (err || null == result || null == result.userId) 
				callBackMethods.failure();
			else
				callBackMethods.success(result)
		});
	});
}


var loadsensordata = function(criteria, callBackMethods){
	MongoClient.connect("mongodb://localhost:27017/sensordatabase", function(err, db) {
		db.collection('sensordata').find( criteria ).toArray(function(err, result) {
			db.close();
			if (err) 
				callBackMethods.failure();
			else
				callBackMethods.success(result)
		});
	});
}

var loadprocesseddata = function(criteria, callBackMethods){
	MongoClient.connect("mongodb://localhost:27017/sensordatabase" , function(err, db) {
		db.collection(callBackMethods.tableName).find( criteria ).toArray(function(err, result) {
			db.close();
			if (err) 
				callBackMethods.failure();
			else
				callBackMethods.success(result)
		});
	});
}

var aggregatedata = function(criteria, callBackMethods){
	MongoClient.connect("mongodb://localhost:27017/sensordatabase", function(err, db) {
		db.collection('sensordata').aggregate( criteria ).toArray(function(err, result) {
			db.close();
			if (err) 
				callBackMethods.failure();
			else
				callBackMethods.success(result)
		});
	});
}

var processhalldata = function(){
	MongoClient.connect("mongodb://localhost:27017/sensordatabase", function(err, db) {
		var _mapper = function(){
			var milis = Date.parse(this.timestamp);
			var date = new Date(milis);
			var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
			emit(daysOfWeek[date.getDay()], 1);
		}
		
		var _reducer = function(key, values){		
			return values.length;
		}	
		var sensordata = db.collection('sensordata');
		sensordata.mapReduce(
			_mapper, 
			_reducer, 
			{ 
			  query  : { sensorId : 'HALL_SENSOR'},
			  out    : { replace : "processeddata_hall_sensor" }
			}, function(err, results, stats){
				return;
			}
			
		);	
		db.close();
	});			
}

var processmstrmdata = function(){
	MongoClient.connect("mongodb://localhost:27017/sensordatabase", function(err, db) {
		var _mapper = function(){
			var milis = Date.parse(this.timestamp);
			var date = new Date(milis);
			var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
			emit(daysOfWeek[date.getDay()], 1);
		}
		
		var _reducer = function(key, values){		
			return values.length;
		}	
		var sensordata = db.collection('sensordata');
		sensordata.mapReduce(
			_mapper, 
			_reducer, 
			{ 
			  query  : { sensorId : 'MSTRM_SENSOR'},
			  out    : { replace : "processeddata_mstrm_sensor" }
			}, function(err, results, stats){
				return;
			}
			
		);	
		db.close();
	});			
}

var processgstrmdata = function(){
	MongoClient.connect("mongodb://localhost:27017/sensordatabase", function(err, db) {
		var _mapper = function(){
			var milis = Date.parse(this.timestamp);
			var date = new Date(milis);
			var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
			emit(daysOfWeek[date.getDay()], 1);
		}
		
		var _reducer = function(key, values){		
			return values.length;
		}	
		var sensordata = db.collection('sensordata');
		sensordata.mapReduce(
			_mapper, 
			_reducer, 
			{ 
			  query  : { sensorId : 'GSTRM_SENSOR'},
			  out    : { replace : "processeddata_gstrm_sensor" }
			}, function(err, results, stats){
				return;
			}
			
		);	
		db.close();
	});			
}


/*
	Get Method not Allowed for authentication
*/
app.get("/auth", function(req, res){
	res.redirect('/login');
});

app.post("/auth", function(req, res){
	if(null != req.body.userId && null != req.body.password && '' != req.body.userId && '' != req.body.password){
	    userValidatoin( {
		        //User Entered Information
				userId: req.body.userId, 
				password:req.body.password
			}, { 
				//If Valid User Call 
				success: function(userInfo){
					req.session.userId = userInfo.userId;
					req.session.name = userInfo.name;
					res.redirect('/home');
				}, 
				//If In-Valid User Call 
				failure: function(){
					res.redirect('/login');
				}
			}
		);
	} else {
		res.redirect('/login');
	}
});	

app.get("/hall", function(req,res){
	if(req.session.userId == undefined)
		res.redirect('/login');
	else res.sendFile(path + "hall-sensor.html");
});

app.get("/master", function(req,res){
	if(req.session.userId == undefined)
		res.redirect('/login');
	else res.sendFile(path + "master-sensor.html");
});

app.get("/guest", function(req,res){
	if(req.session.userId == undefined)
		res.redirect('/login');
	else res.sendFile(path + "guest-sensor.html");
});

app.get("/charts", function(req,res){
	if(req.session.userId == undefined)
		res.redirect('/login');
	else res.sendFile(path + "charts.html");
});


app.get("/processdata", function(req,res){
	if(req.session.userId == undefined)
		res.redirect('/login');
	else {
		processhalldata();
		processmstrmdata();
		processgstrmdata();
		
		res.sendFile(path + "charts.html");
	}
});


app.get("/loadsensordata", function(req,res){
	var urlstring = url.parse(req.url, true);
	var query = urlstring.query;
	if(req.session.userId != undefined && '' != query.sensorId){
		var searchCriteria = {};
		searchCriteria.sensorId = query.sensorId;
		
		if(null != query.month && '' != query.month ){
			searchCriteria.month = JSON.parse(query.month);
			if(null != query.day && '' != query.day){
				searchCriteria.day = JSON.parse(query.day);
			}
		}
		logger.log(JSON.stringify(searchCriteria));
	    loadsensordata( searchCriteria , { 
			success: function(rows){
				res.json(rows);
			}, 
			failure: function(){
				res.json({});
			}
		});
	} else res.json({});
});


app.get("/loadradarchart", function(req,res){
	if(req.session.userId != undefined){
	    aggregatedata( [{ 
			     $group : { 
					"_id" : "$sensorId",  
				    "count" : {  
						$sum : 1  
					} 
				}	
			}] , { 
				success: function(chart){
					res.json(chart);
				}, 
				failure: function(){
					res.json({});
				}
			}
		);
	} else res.json({});
});


app.get("/loadcharts", function(req,res){
	var urlstring = url.parse(req.url, true);
	var query = urlstring.query;
	if(req.session.userId != undefined && '' != query.sensorId){
		var tableName = '';
		if(query.sensorId == 'HALL_SENSOR'){
			tableName = 'processeddata_hall_sensor';
		} else if(query.sensorId == 'MSTRM_SENSOR'){
			tableName = 'processeddata_mstrm_sensor';
		} else if(query.sensorId == 'GSTRM_SENSOR'){
			tableName = 'processeddata_gstrm_sensor';
		}
	    loadprocesseddata( {} , { 
		  tableName: tableName,
			success: function(rows){
				res.json(rows);
			}, 
			failure: function(){
				res.json({});
			}
		});
	} else res.json({});
});

app.get("/getuser", function(req,res){
	logger.log('req.session.userId = '+ req.session.userId);
	if(req.session.userId != undefined)
		res.json({'name': req.session.name});
	else res.json({});
});

/*
  Server Start up 
  Default Port: 3003
*/
app.listen(process.env.PORT || 3003, () => {				
	logger.log('##################################################');
	logger.log('        hitdataexp/reportscomponent');
	logger.log('        Process Port :' + process.env.PORT);
	logger.log('        Local Port   :' + 3003);
	logger.log('##################################################');
});	



