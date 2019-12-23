const msql = require('mysql');

const express = require('express');
const router = express.Router();

const pool  = msql.createPool({ //create connection
	connectionLimit: 100,
	host 	: 'localhost',
	user 	: 'root',
	password: '8347@MySql',
	database: 'atempdb'
});

router.get('/:userId/:dateFrom/:dateTill', (req, res) => {
	pool.getConnection(function(err, conn) {  //connect to conn

	  if (err) {
	    console.error('error connecting: ' + err.stack);
	    return;
	  }
	  conn.query({
	      sql: `SELECT * FROM offtake WHERE takingDate BETWEEN '${req.params.dateFrom}' AND '${req.params.dateTill}' AND reqBy=${req.params.userId}`
	  	}, (error, results) => {
		   if (error) return console.log(error);
		    console.log('Offtake...');
		    //console.log('Result: ', results);
		    res.status(200).send(results);
	  });
	  conn.release(); 
	});
});

router.get('/:userId/:atDate/', (req, res) => {
	pool.getConnection(function(err, conn) {  //connect to conn
			
	  if (err) {
	    console.error('error connecting: ' + err.stack);
	    return;
	  }

	  conn.query({
	      sql: `SELECT * FROM offtake WHERE reqBy = ${req.params.userId} AND takingDate = '${req.params.atDate}'`
	  	}, (error, results) => {
		   if (error) return error; 
		    console.log('Resolving...');
		    res.status(200).send(results);
	  });
	  conn.release(); 
	});
});

module.exports = router;