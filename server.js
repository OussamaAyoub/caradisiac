const express       = require('express');
const bodyParser    = require('body-parser');
const app           = express();
const port          = 9292;

app.use(bodyParser.urlencoded({ extended: true }));

/*
 * Call the api.
 */
require('./caradisiac')(app, {});

app.listen(port, () => {
  console.log('We are live on ' + port);
});