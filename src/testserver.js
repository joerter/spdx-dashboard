var express = require("express"),
    app     = express(),
    port    = parseInt(process.env.PORT, 10) || 8080,
    morgan = require('morgan');

//app.use(express.methodOverride());
//app.use(express.bodyParser());
app.use(express.static(__dirname + '/'));
//app.use(app.router);
app.use(morgan('dev'));

app.listen(port);
console.log('Now serving the app at http://localhost:' + port);
