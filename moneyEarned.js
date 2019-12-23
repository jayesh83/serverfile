const mysql = require('mysql');
const express = require('express');
const router = express.Router();

const pool = mysql.createPool({ //create connection
	connectionLimit: 100,
	host: 'localhost',
	user: 'root',
	password: '8347@MySql',
	database: 'atempdb'
});

function runQuery(type, res, conn, query) {
	conn.query(query, (error, results) => {
		if (error) {
			console.log("Error executing sql: ", error.message);
			return res.send(error.message);
		}
		console.log('result: ', results, '\nlength: ', results.length);
		if (type == 'singleDate') {
			if (results.length == 0) {
				console.log("No attendance found of user");
				return res.send(`NO_ATTENDANCE_FOUND`);
			}
		}
		if (type == 'dateRange') {
			if (results[0].att == null) {
				console.log("No attendance found of user");
				return res.send(`NO_ATTENDANCE_FOUND`);
			}
		}
		let totalAttendance = 0;
		for (let i = 0; i < results.length; i++)
			totalAttendance += results[i].att;

		var totalMoneyEarned = totalAttendance * (global.wage);
		results.push({ "totalMoneyEarned": totalMoneyEarned });
		//console.log('json: ', results);
		res.json(results);
	});
}

async function runFirst(uid) {
	return await new Promise((resolve, reject) => {
		pool.getConnection((err, conn) => {
			if (err)
				return reject('00' + err);
			conn.query(`SELECT wage FROM wage where userId = ${uid}`, (error, results) => {
				if (error)
					return reject('11' + error);
				console.log('wage: ', results.length > 0 ? results[0].wage : results);
				resolve(results);
			});
		}); // getConnetion()
	})// promise
}

router.get('/:userId/:startDate/:endDate', (req, res) => {
	var sd, ed, uid;
	uid = req.params.userId;
	sd = req.params.startDate;
	ed = req.params.endDate;
	const rf = runFirst(uid);
	rf
		.then(results => {
			//console.log('second result: ', results);
			if (results.length == 0) {
				console.log('user does not exist...');
				return res.send('USER_NOT_EXIST');
			}
			if (results[0].wage == null) {
				console.log('No wage defined...');
				return res.send('NO_WAGE_DEFINED');
			}
			global.wage = parseInt(results[0].wage);
			pool.getConnection((err, conn) => {
				if (err) {
					console.log('Error connecting DB: ', err.stack);
					return res.send(err);
				}	// todo: fetch attendance in project wise form like at which project what was the attendance and calculate salary
				runQuery('dateRange', res, conn, `SELECT SUM(att) AS att, atProject FROM attendance WHERE 
				userId = ${uid} AND DATE BETWEEN '${sd}' AND  '${ed}' GROUP BY atProject`);
			}); // getConnection
		}) // then
		.catch(error => {
			let type = String(error).slice(0, 2);
			if (type == '00') {
				console.log('Error conncting to DB', error);
				return res.send(error);
			}
			if (type == '11') {
				console.log('Error executing sql', error);
				return res.send(error);
			}
		}); // catch
});

router.get('/:userId/:atDate', (req, res) => {
	const ad = req.params.atDate, uid = req.params.userId;
	const rf = runFirst(uid);
	rf
		.then(results => {
			if (results.length == 0) {
				console.log('user does not exist...');
				return res.send('USER_NOT_EXIST');
			}

			if (results[0].wage == null) {
				console.log('No wage defined...');
				return res.send('NO_WAGE_DEFINED');
			}
			global.wage = parseInt(results[0].wage);
			pool.getConnection((err, conn) => {
				if (err) {
					console.log('Error connecting DB: ', err.stack);
					return res.send(err);
				}
				runQuery('singleDate', res, conn, `SELECT att, atProject FROM attendance WHERE userId = ${uid} AND DATE = '${ad}' `);
			}); // getConnection
		}) // then
		.catch(error => {
			let type = String(error).slice(0, 2);
			if (type == '00') {
				console.log('Error conncting to DB', error);
				return res.send(error);
			}
			if (type == '11') {
				console.log('Error executing sql', error.message);
				return res.send(error.message);
			}
		}); // catch
});

module.exports = router;