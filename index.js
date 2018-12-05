const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const cors = require('cors')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser');
const md5 = require('md5');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

express()
	.use(express.static(path.join(__dirname, 'public')))
	.use(bodyParser.json())
	.use(cors())
	.post('/auth', async (req, res) => {
		if (req.body.name == null || req.body.name == "") {
			res.send(400, { error: "Please provide name" });
			return;
		}
		try {
			const client = await pool.connect();
			let results;
			const name= req.body.name;
			const query= "SELECT * FROM users WHERE name='"+ name.toLowerCase() +"';";
			const user = await client.query(query);
			if(user.rowCount !== 0) {
				results= {
					id: user.rows[0].id,
					name: user.rows[0].name,
					token: md5(user.rows[0].id.toString())
				}
			} else {
				res.send(401);
        return;
			}
      res.json(results);
      client.release();
		} catch (err) {
			console.error(err);
      res.send("Error " + err);
		}
	})
	.get('/travelers', async (req, res) => {
    try {
			const client = await pool.connect();
			const query= `SELECT * FROM users ORDER BY id ASC;`;
      const result = await client.query(query);
      const results = { 'results': (result) ? result.rows : null};
      res.json(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
	})
	.patch('/travelers/:id', async (req, res) => {
		if (req.params.id == null || req.params.id == "") {
			res.send(400, { error: "Please provide travelers id" });
			return;
		}
		try {
			const client = await pool.connect();
			let userDestinations;
			console.log(req.body.destinations);
			const query= "UPDATE users SET destinations= '"+JSON.stringify(req.body.destinations)+"' WHERE id="+ req.params.id +";"
			const result = await client.query(query);
			if(result.rowCount > 0) {
				let userDestintionsQuery= "SELECT destinations FROM users WHERE id="+ req.params.id +" ORDER BY id ASC;";
				const userDestintionsQueryResult = await client.query(userDestintionsQuery);
				userDestinations = { 'results': (userDestintionsQueryResult) ? userDestintionsQueryResult.rows : null};
			}
      res.json(userDestinations);
      client.release();
		} catch (err) {
			console.error(err);
      res.send("Error " + err);
		}
	})
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
