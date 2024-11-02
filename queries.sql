
-- creating users table
create table users (
	id serial primary key,
	first_name varchar(50),
	last_name varchar(50),
	email varchar(100) unique,
	pass text,
	appartment varchar(50),
	city varchar(50),
	stat varchar(50),
	pin_code integer,
	phone varchar(10) unique
);

-- creating a user in users table
insert into users (first_name, last_name,email,pass) values ('Akash', 'sha', 'asjdh@gmail.com', 'pass2301');

-- check wheteher the user exists or not
SELECT * from users where email = vinnerhooda@gmail.com

--creating a newsletter table
create table newsletter (
	id serial,
	email varchar(50) primary key
);

-- inserting into the newsletter
insert into newsletter (email) values ('vinnerhooda@gmail.com');

-- creating products table
create table products (
	id serial primary key,
	name varchar(50),
	description varchar(500),
	l int,
	b int,
	h int,
	seatHeight int,
	armHeight int,
	seatDepth int,
	legHeight int
);

insert into products values();

-- CREATING ORDERS TABLE
create table orders (
	id serial primary key,
	user_id integer,
	product_id integer,
	qty integer,
	amount integer,
	CONSTRAINT fk_user FOREIGN KEY (user_id) 
	REFERENCES users(id),
	CONSTRAINT fk_product FOREIGN KEY (product_id)
	REFERENCES products(id)
);
insert into orders (user_id, product_id, qty, amount) values (1, 10, 2, 1000);