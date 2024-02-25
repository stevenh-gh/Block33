const express = require("express");
const pg = require("pg");
const app = express();
const client = new pg.Client(process.env.DATABASE_URL || "postgres://localhost/acme_hr_directory");

app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/employees", async (req, res, next) =>
{
	let sql = `
		select * from employee;
	`;
	const response = await client.query(sql);
	res.send(response.rows);
});

app.get("/api/departments", async (req, res, next) =>
{
	let sql = `
		select * from department;
	`;
	const response = await client.query(sql);
	res.send(response.rows);
});

const init = async () =>
{
	console.log("connecting to db");
	client.connect();
	console.log("connected to db");

	console.log("creating department table");
	let sql = `
		create table if not exists department(
			id serial primary key,
			name varchar(255) not null
		);
	`;
	await client.query(sql);
	console.log("created department table");

	console.log("creating employee table");
	sql = `
		drop table if exists employee;
		create table employee(
			id serial primary key,
			name varchar(255) not null,
			created_at timestamp default now(),
			updated_at timestamp default now(),
			department_id integer references department(id) not null
		);
	`;
	await client.query(sql);
	console.log("created employee table");

	console.log("seeding db");
	sql = `
		insert into department
			(name)
		values
			('food'),
			('entertainment'),
			('office supplies');

		insert into employee
			(name, department_id)
		values
			('steven', 1),
			('employee2', 2),
			('employee3', 3);
	`;
	await client.query(sql);
	console.log("seeded db");

	const port = 3000;
	app.listen(port, () =>
	{
		console.log(`listening on port ${port}`);
	});
};

init();
