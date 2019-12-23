const msql = require('mysql');
const moment = require('moment');
const express = require('express');
const router = express.Router();
const Joi = require('joi');

const pool  = msql.createPool({ //create connection
	connectionLimit: 100,
	multipleStatements: true,
	host 	: 'localhost',
	user 	: 'root',
	password: '8347@MySql',
	database: 'atempdb'
});
// userId is the phone1
router.post('/ru', (req, res) =>{
	var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
	var userId, fname, type, dob, sex, mname, lname, salary, phone2, password,cls;  // cls - current login status
	userId = getValue(req.body.userId);
	dob = getValue(req.body.dob);
	fname = getValue(req.body.fname);
	mname = getValue(req.body.mname);
	lname = getValue(req.body.lname);
	salary = getValue(req.body.salary);
	phone2 = getValue(req.body.phone2);
	password = getValue(req.body.password);
	type = req.body.type;
	sex = req.body.sex;
	cls = req.body.cls;

	var objToValidate = {
		userId: userId,
		fname : fname,
		mname : mname,
		lname : lname,
		bdyear : dob.slice(0,4),
		salary: salary,
		phone2: phone2,
		password : password
	}
	console.log("Object passed",objToValidate);
	// validating user info
	// one character cannot be validated through Joi that's why not validating...
	const Schema = Joi.object().keys({
			userId: Joi.number().integer().max(9999999999).required(),
			fname : Joi.string().min(3).max(50).required(),
			mname : Joi.string().min(3).max(50).allow(null,''),
			lname : Joi.string().min(3).max(50).allow(null,''),
			bdyear : Joi.date().min('01-01-1920').iso(),
			salary: Joi.number().integer().min(0).max(999999999).allow(null,''),
			phone2: Joi.number().integer().max(9999999999).allow(null,''),
			password: Joi.string().min(6).max(20).required(),
	});
	
	const validatedObj = Joi.validate(objToValidate,Schema);
	  if (validatedObj.error == null)
	  	console.log("User Info checking : correct(Ok)");
	  else{
		console.log("wrong user info : ",validatedObj.error.details);
		return res.send(validatedObj.error.details);
	  }

	  pool.getConnection( (err, conn) => {
			if (err){
				console.log( 'Error connecting: ', err.stack);
				return res.send(err);
			}
			 conn.query(`INSERT INTO user values(${userId},'${fname}','${mname}','${lname}',
				 '${type}','${dob}','${sex}',${salary},${phone2});
				 INSERT INTO user_auth(userId, password, type, cls) values(${userId},'${password}','${type}','${cls}')`
			 ,(error, results) => {
				if (error){
					console.log("Error executing sql: ",error.message);
					return res.send(error);
				}
				console.log('results: ', results);
				res.send(results);
				conn.release();
			});
	    });
});

// function to return null is nothing is specified in particular input field
function getValue(data){
	if (data == null)
		return null;
	else
		return data;
}
module.exports = router;