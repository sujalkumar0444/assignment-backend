const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
// const dotenv = require("dotenv");
// dotenv.config();
// dbconnect
const { mongoDBConnect } = require("./mongoConfig");

// dbconnection
mongoDBConnect();

//middleware
const isValidUser = require("./middlewares/isValidUser");

//Routes
const signupRouter = require("./router/user/signup");
const loginRouter = require("./router/user/login");
const createCarRouter = require("./router/car/createCar");
const listOfCarsRouter = require("./router/car/listOfCars");
const searchCarRouter = require("./router/car/searchCar");
const carDetailsRouter = require("./router/car/carDetails");
const updateDetailsRouter = require("./router/car/updateDetails");
const deleteCarRouter = require("./router/car/deleteCar");



// cors
app.use(cors({
    origin: '*'
}));


// parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

const TIMEOUT = 300000; 
const PORT = process.env.PORT || 8800;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//timeout
server.setTimeout(TIMEOUT);

// routes
app.get('/', (req, res) => {
    res.send("Welcome to the server");
});

app.use('/api/signup', signupRouter);
app.use('/api/login', loginRouter);
app.use('/api/add/car',isValidUser, createCarRouter);
app.use('/api/list/cars',isValidUser, listOfCarsRouter);
app.use('/api/search/car',isValidUser, searchCarRouter);
app.use('/api/car',isValidUser, carDetailsRouter);
app.use('/api/update/car',isValidUser, updateDetailsRouter);
app.use('/api/delete/car',isValidUser, deleteCarRouter);




app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error'
        }
    });
});
