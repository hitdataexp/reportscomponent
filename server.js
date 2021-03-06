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
var MongoClient  = require('mongodb').MongoClient;
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//MongoDB Connection Details
var mongoose = require('mongoose');

var mongoDBDetails = {
   _MONGO_UID: process.env.MLAB_MONGO_UID || '',
   _MONGO_PWD: process.env.MLAB_MONGO_PWD || ''
}

mongoose.connect('mongodb://' + mongoDBDetails._MONGO_UID + ':' + mongoDBDetails._MONGO_PWD + '@ds133251.mlab.com:33251/hitdataexpsession');
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


/*
	REST API Access from Raspberry
*/

var getSequence = function(callBackMethods){
	MongoClient.connect("mongodb://" + mongoDBDetails._MONGO_UID + ":" + mongoDBDetails._MONGO_PWD + "@ds133261.mlab.com:33261/hitdataexpsensordatabase", function(err, db) {
		db.collection('sensordata').find({}).toArray(function(err, result) {
			db.close();
			if (err) 
				callBackMethods.failure();
			else
				callBackMethods.success(result.length)
		});
	});
}

var insertSensorData = function(data, callBackMethods){
	console.log(data.id)
	MongoClient.connect("mongodb://" + mongoDBDetails._MONGO_UID + ":" + mongoDBDetails._MONGO_PWD + "@ds133261.mlab.com:33261/hitdataexpsensordatabase", function(err, db) {
		db.collection('sensordata').insert(data, function(err, result) {
			db.close();
			if (err) 
				callBackMethods.failure();
			else
				callBackMethods.success(result)
		});
	});
}


var userValidatoin = function(user, callBackMethods){
	MongoClient.connect("mongodb://" + mongoDBDetails._MONGO_UID + ":" + mongoDBDetails._MONGO_PWD + "@ds133251.mlab.com:33251/hitdataexpuserdata", function(err, db) {
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
	MongoClient.connect("mongodb://" + mongoDBDetails._MONGO_UID + ":" + mongoDBDetails._MONGO_PWD + "@ds133261.mlab.com:33261/hitdataexpsensordatabase", function(err, db) {
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
	MongoClient.connect("mongodb://" + mongoDBDetails._MONGO_UID + ":" + mongoDBDetails._MONGO_PWD + "@ds133261.mlab.com:33261/hitdataexpsensordatabase" , function(err, db) {
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
	MongoClient.connect("mongodb://" + mongoDBDetails._MONGO_UID + ":" + mongoDBDetails._MONGO_PWD + "@ds133261.mlab.com:33261/hitdataexpsensordatabase", function(err, db) {
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
	MongoClient.connect("mongodb://" + mongoDBDetails._MONGO_UID + ":" + mongoDBDetails._MONGO_PWD + "@ds133261.mlab.com:33261/hitdataexpsensordatabase", function(err, db) {
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
	MongoClient.connect("mongodb://" + mongoDBDetails._MONGO_UID + ":" + mongoDBDetails._MONGO_PWD + "@ds133261.mlab.com:33261/hitdataexpsensordatabase", function(err, db) {
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
	MongoClient.connect("mongodb://" + mongoDBDetails._MONGO_UID + ":" + mongoDBDetails._MONGO_PWD + "@ds133261.mlab.com:33261/hitdataexpsensordatabase", function(err, db) {
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
	REST API for external Access
*/

app.post("/insertdata", function(req, res){
	logger.log('1. insertdata Triggered');
	if(null != req.body.userId && null != req.body.password && '' != req.body.userId && '' != req.body.password){
		logger.log('2. Validating User');
	    userValidatoin( {
		        //User Entered Information
				  userId: req.body.userId, 
				password: req.body.password
			}, { 
				//If Valid User Call 
				success: function(validUserStatus){
					logger.log('3. Getting Next Number');
					getSequence({
						success: function(nextNumber){
							logger.log('4. Prepare Data');
							var data = {
								id: (nextNumber + 1)
							};
							if(null != req.body.sensorId && '' != req.body.sensorId){
								data['sensorId'] = req.body.sensorId;
							}
							if(null != req.body.month && '' != req.body.month){
								data['month'] = Number(req.body.month);
							}
							if(null != req.body.day && '' != req.body.day){
								data['day'] = Number(req.body.day);
							}
							if(null != req.body.hour && '' != req.body.hour){
								data['hour'] = Number(req.body.hour);
							}
							if(null != req.body.minute && '' != req.body.minute){
								data['minute'] = Number(req.body.minute);
							}
							if(null != req.body.second && '' != req.body.second){
								data['second'] = Number(req.body.second);
							}
							data['timestamp'] = new Date();
							
							insertSensorData(data, {
								success: function(insertStatus){
									logger.log('5. Inserted Data - ' + insertStatus);
									res.json({status: true});
								},
								failure: function(){
									logger.log('5. Inserted Data Failure');
									res.json({status: false});
								}
							});
						}, 
						failure: function(){
							logger.log('3. Getting Next Number Failure');
							res.json({status: false});
						}
					});
				}, 
				//If In-Valid User Call 
				failure: function(){
					logger.log('2. User Validation Failed');
					res.json({status: false});
				}
			}
		);
	} else {
		res.json({});
	}
});

/*
  Server Start up 
  Default Port: 3003
*/
app.listen(process.env.PORT || 3001, () => {				
	logger.log('##################################################');
	logger.log('        hitdataexp/reportscomponent');
	logger.log('        Process Port :' + process.env.PORT);
	logger.log('        Local Port   :' + 3001);
	logger.log('##################################################');
});	
