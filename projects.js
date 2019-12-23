const msql = require('mysql');
const express = require('express');
const router = express.Router();


const pool = msql.createPool({ //create connection
	connectionLimit: 100,
	host: 'localhost',
	user: 'root',
	password: '8347@MySql',
	database: 'atempdb'
});

function runQuery(res, conn, query) {
	conn.query(query, (error, results) => {
		if (error) {
			console.log("Error executing sql: ", error.message);
			return res.send(error);
		}
		console.log(results);
		res.send(results);
	});
};

router.get('/:userId/:startDate/:endDate', (req, res) => {
	var sd, ed, uid;
	uid = req.params.userId;
	sd = req.params.startDate;
	ed = req.params.endDate;
	pool.getConnection((err, conn) => {
		if (err) {
			console.log('Error connecting: ', err.stack);
			return res.send(err);
		}
		runQuery(res, conn, `SELECT * FROM project WHERE userId = ${uid} AND startDate BETWEEN '${sd}' AND '${ed}'`);
		//conn.release();
	});
});

module.exports = router;