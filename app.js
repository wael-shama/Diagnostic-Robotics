const express = require('express');
const bodyParser = require('body-parser');
const DataStore = require('./dataStore'); // Import the DataStore module
const prescriptionRouter = require('./prescriptionRouter'); // Import the prescription router
const app = express();

// Middleware to parse JSON requests
app.use(bodyParser.json());

const dataStore = new DataStore();
app.set('dataStore', dataStore);

// prescription router
app.use('/prescriptions', prescriptionRouter);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;