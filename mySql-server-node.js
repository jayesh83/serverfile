const msql = require('mysql');
const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const debug = require('debug')('app:startup');
const offtake = require('./routes/offtake');
const attendance = require('./routes/attendance');
const moneyEarned = require('./routes/moneyEarned');
const projects = require('./routes/projects');
const user = require('./routes/user');

const port = process.env.PORT || 3000;
var endResult = 'something';

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use('/go/', offtake);
app.use('/ga/', attendance);
app.use('/gme/', moneyEarned);
app.use('/gp/', projects);
app.use('/u/', user);
if (app.get('env') === 'development'){
	app.use(morgan('tiny'));
//	console.log('Morgan enabled...');
	debug('Morgan enabled...');
};

const pool  = msql.createPool({ //create connection
	connectionLimit: 100,
	host 	: 'localhost',
	user 	: 'root',
	password: '8347@MySql',
	database: 'atempdb'
});

app.get('/:id', (req, res) => {
	pool.getConnection(function(err, conn) {  //connect to conn

	  if (err) {
	    console.error('error connecting: ' + err.stack);
	    return;
	  }
	 	conn.query(`SELECT SUM(money) FROM offtake AS totalOfftake where reqBy = ${req.params.id}`, (error, results) => {
		  		console.log('offtake', results);
		  });

		conn.query(`SELECT COUNT(att) FROM attendance AS totalAtt where userId = ${req.params.id}`, (error, results) => {
		  		console.log('attendance', results);
		  	});

		conn.query(`SELECT COUNT(projectId) FROM project AS totalProject where userId = ${req.params.id}`, (error, results) => {
		  		console.log('project', results);
		  	});
	  conn.release();
	});
	res.status(200).send('working...');
});


// query to the connection
// #1
// connection.query({
//   sql: 'SELECT * FROM `user`'
// }, (error, results, fields) => {
// 	console.log('1st...');
// 	console.log('Result: ', results);
// });

// // #2
// connection.query('SELECT todayStatus FROM attendance WHERE `userId`=?',['smith32'], (error, results, fields) => {
// 	console.log('2nd...');
// 	console.log('Result: ', results);
// });

// // #3
// connection.query({
//   sql: 'SELECT * FROM `offtake`'
// }, (error, results, fields) => {
// 	if (error)
// 		console.log(error);
// 	console.log('3rd...');
// 	console.log('Result: ', results);
// });
// processing each row by categories...

// var query = connection.query('SELECT * FROM offtake');
// query
//   .on('error', function(err) {
//     // Handle error, an 'end' event will be emitted after this as well
//   })
//   .on('fields', function(fields) {
//     // the field packets for the rows to follow
//   })
//   .on('result', function(row) {
//     // Pausing the connnection is useful if your processing involves I/O
//     //connection.pause();
//  	console.log('Result: ', row);
//   })
//   .on('end', function() {
//     // all rows have been received
//   	console.log('all task is completed...');
//   });

app.listen(port, () => console.log(`Listening on port : ${port}`));