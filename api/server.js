require('dotenv').config();
const cors = require('cors');
const express = require('express');

const app = express(), port = process.env.PORT || 3000, bodyParser = require('body-parser');

app.use(
  cors({
    origin:'*',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    optionsSuccessStatus:204,
    preflightContinue:false
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  req.setTimeout(1000 * 45, () => {
    res.status(200).json(helper.APIReturn(1, "timeout"));
  });
  next();
});

const routes = require('./routes');
routes(app);
app.listen(port);

console.log('Floppy Bird api started on: ' + port);