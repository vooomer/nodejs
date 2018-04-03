# Mysql-wrapper

A wrapper of [node-mysql](https://github.com/felixge/node-mysql) to improve fault tolerance, including enhanced query generator and data escaping which powered by [typo](https://github.com/kaelzhang/typo) template engine.

Mysql-wrapper is also a **supervisor** and a **minor** set of node-mysql.

Mysql-wrapper is created to solve the "Cannot enqueue Handshake after already enqueuing a Handshake" error of node-mysql and more.

## Installation

	npm install mysql-wrapper --save
	
## Usage

```js
var mysql = require('mysql-wrapper');
var conn = mysql({
	host: '127.0.0.1',
	port: '3306',
	user: 'root',
	password: '123456',
	database: 'test',
});
conn.query(...);
```

# Methods
There're only two methods, maybe one, that you'd frequently use.

## conn.query(sql, data, callback)

Execute a mysql query.

If you use helpers below, the parameters will be ** automatically escaped if necessary ** in order to avoid SQL Injection attacks.

##### sql
`String` a special version of [typo](https://github.com/kaelzhang/typo) syntax which optimized for sql grammar is provided.

##### data
`Object` template data for typo

##### callback
`function(err, result)` Callback of mysql quering

### Example: Available helpers

##### Mysql WHERE: {{where data}}

```js
conn.query('SELECT * FROM table {{where data}}', {
	data: {
		a: 1,
		b: 'abc'
	}
}, function(err, result){
	console.log(err, result)
});
```
	
##### Mysql VALUES: {{values values}}

```js
'INSERT INTO table {{values values}}', {
	values: {
		a: 1,
		b: 2
	}
}

-> INSERT INTO table (a, b) VALUES ('1', '2')
```	
	
##### Mysql SET: {{set data}}

```js
'INSERT INTO table {{set data}}', {
	data: {
		a: 1,
		b: 2
	}
}

-> INSERT INTO table SET a = '1', b = '2'
```
	
##### Mysql ON: {{on condition}}

##### Mysql UPDATE: {{update data}}

##### Use them together

```js
'SELECT p.a, p.b, q.a FROM p INNER JOIN q {{on 0}} {{where 1}}', [
	{
		'p.a': 'q.a',
	}, 
	{
		'q.b': 1
	}
]
```

## conn.end()

Close the current connection, if there's another `conn.query` executed, the connection will be **automatically created** again.

For an application of high concurrence, you should **NEVER** use this method!