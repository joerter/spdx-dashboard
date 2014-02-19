var express = require('express');
var mysql = require('mysql');
var cs = require('./connectionSettings.js');
var app = express();

console.log("Will connect to database " + cs.database + " with user " + cs.user);

// Create a connection pool
var pool = mysql.createPool({
    database: cs.database,
    user : cs.user,
    password : cs.password 
});

// GET /spdxdocs
app.get('/api/spdxdocs', function(req, res){
    pool.getConnection(function(err, connection) {
        if(err != null) {
            res.end('Error connecting to mysql:' + err+'\n');
        }

        var sql = "select * from spdx.spdx_docs";

        var query = connection.query(sql, function(err, rows){
            if (err != null) {
                res.end("Query error:" + err);
            } else {
                res.send(rows);
            }
            // Release this connection
            connection.release();
        });

        console.log(query.sql);
    });
});

// GET /spdxdocs/{id}
app.get('/api/spdxdocs/:id', function(req, res){
    pool.getConnection(function(err, connection) {
        if (err != null) {
            res.end('Error connecting to mysql:' + err+'\n');
        }

        var sql = "select * from spdx.spdx_docs where id = " + 
                connection.escape(req.params.id);

        var query = connection.query(sql, function(err, rows){
            if (err != null) {
                res.end("Query error:" + err);
            } else {
                res.send(rows);
            }
            // Release the connection
            connection.release();
        });

        console.log(query.sql);
    });
});

app.listen('3000');
console.log('Listening for connections on 3000');

