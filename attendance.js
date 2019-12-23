const msql = require('mysql');
const express = require('express');
const router = express.Router();

const pool = msql.createPool({ //create connection
	connectionLimit: 100,
	multipleStatements: true,
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
		if (results.length == 0) {
			console.log('no attendance found of user...', results);
			return res.send('NO_ATTENDANCE_FOUND');
		}
		console.log('results: ', results);
		res.send(results);
	});
};

var response = [];
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
		conn.query(`SELECT SUM(att) as totalAttendance FROM attendance WHERE date BETWEEN '${sd}' AND '${ed}' AND 
		userId = ${uid}`, (error, results) => {
			if (results[0].totalAttendance === null) {
				console.log('no attendance found of user...', results);
				return res.send('NO_ATTENDANCE_FOUND');
			}
			res.write(JSON.stringify(results));
			runQuery(res, conn, `SELECT * FROM attendance WHERE date BETWEEN '${sd}' AND '${ed}' AND 
			userId = ${uid} ORDER BY date DESC`);
		});
		conn.release();
	});
});

router.get('/:userId/:atDate', (req, res) => {
	var ad, uid;
	uid = req.params.userId;
	ad = req.params.atDate;
	pool.getConnection((err, conn) => {
		if (err) {
			console.log('Error connecting: ', err.stack);
			return res.send(err);
		}
		runQuery(res, conn, `SELECT * FROM attendance WHERE userId = ${uid} AND date = '${ad}'`);
		conn.release();
	});
});

router.post('/:userId', (req, res) => {
	pool.getConnection((err, conn) => {
		if (err) {
			console.log('Error connecting: ', err.stack);
			return res.send(err);
		}
		runQuery(res, conn, `INSERT INTO attendance VALUES(${req.params.userId},
			 '${req.body.date}', ${req.body.attendance}, '${req.body.ts}', '${req.body.atProject}')`);
		conn.release();
	});
});

router.put('/:userId/:atDate', (req, res) => {
	pool.getConnection((err, conn) => {
		if (err) {
			console.log('Error connecting: ', err.stack);
			return res.send(err);
		}
		runQuery(res, conn, `UPDATE attendance SET att = ${req.body.attendance}, atProject = '${req.body.atProject}' WHERE date = '${req.params.atDate}' AND userId = '${req.params.userId}'`);
		conn.release();
	});
});

module.exports = router;