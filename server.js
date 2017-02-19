/*
	hitdataexp
*/

var express      = require("express");
var app          = express();
var logger       = require("logging_component");

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
			if (err) 
				callBackMethods.failure();
			else
				callBackMethods.success(result)
		});
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

app.get("/chart1", function(req,res){
	if(req.session.userId == undefined)
		res.redirect('/login');
	else res.sendFile(path + "chart1.html");
});

app.get("/chart2", function(req,res){
	if(req.session.userId == undefined)
		res.redirect('/login');
	else res.sendFile(path + "chart2.html");
});


app.get("/getuser", function(req,res){
	logger.log('req.session.userId = '+ req.session.userId);
	if(req.session.userId != undefined)
		res.json({'name': req.session.name});
	else res.json({});
});

app.get("/getdata", function(req,res){
	if(null != req.session.userId || 'undefined' != req.session.userId){
		res.json({});
	} else res.json({});
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



