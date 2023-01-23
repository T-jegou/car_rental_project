const { logger } = require('../services/loggerService');
const { validationResult } = require('express-validator');
const { isAgentExistAndPasswordCorrect, isCarIdValid, daysBetween, isCarAvailable } = require('../lib/tools');
const mongoose = require('mongoose');
const {carSchema} = require('../models/Car');
const {userSchema} = require('../models/User');
const {reservationSchema} = require('../models/Reservation');

const Car = mongoose.model('Car', carSchema);
const Customer = mongoose.model('User', userSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);

const processReservation = (reservation, reservationChannel) => {
    reservationContent = JSON.parse(reservation.content.toString());
    const delay = Math.floor(Math.random() * 4) + 1;
    setTimeout(delay* 1000, () => {
        reservationChannel.ack(reservation);
        logger.info("AMQP - New reservation received: " + reservationContent + "from the exchange reservations, process in ${delay} seconds");
    });
}

/**
 * Add new car to the catalog
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const AddCarToCalatog = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    try {
        const agent = await isAgentExistAndPasswordCorrect(req.body.email, req.body.password);
        if (typeof agent === "object") {
            let newCarDetail = {
                brand: req.body.brand,
                model: req.body.model,
                numberOfSeat: req.body.numberOfSeat,
                pricePerDay: req.body.pricePerDay,
                available: req.body.available
            }
            const newCar = new Car(newCarDetail);
            newCar.save((err, car) => {
                if (err) {
                    res.status(500).json("Cannot add this new car : " + err);
                }
                else {
                    res.status(201).json(car);
                }
            });
        } else {
          res.status(401).json("Cannot find your agent account");
        }
    } catch (err) {
    res.status(500).json("Error while adding car to database" + err);
    }
}


/**
 * Check if a client is registred
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const CheckIfClientIsRegistred = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    try {
        const agent = await isAgentExistAndPasswordCorrect(req.body.email, req.body.password);
        if (typeof agent === "object") {
            customerEmail = req.body.customerEmail;
            try {
                let customer = await Customer.findOne({email: customerEmail});
                if (customer) {
                    res.status(200).json(customer);
                } else {
                    res.status(401).json("Cannot find customer account with this email");
                }
            } catch (err) {
                res.status(500).json("Error while searching client to customer database" + err);
            }
        } else {
          res.status(401).json("Cannot find your agent account");
        }
    } catch (err) {
    res.status(500).json("Error while searching client to customer database" + err);
    }
}    


/**
 * Process a reservation from agency
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const CreateReservationFromAgency = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    try {
        const agent = await isAgentExistAndPasswordCorrect(req.body.email, req.body.password);
        if (typeof agent === "object") {
            let customer = await Customer.findOne({email: req.body.customerEmail});
            if (customer) {
                const car = await isCarIdValid(req.body.carID);
                const availability = await isCarAvailable(req.body.carID, req.body.startDate, req.body.endDate);
                // console.log(availability);
                if (typeof car === "object") {
                    console.log(availability);
                    if (availability) {
                        const durationReservation = await daysBetween(req.body.endDate, req.body.startDate);
                        let newReservationDetail = {
                            userID: customer._id,
                            carID: req.body.carID,
                            startDate: req.body.startDate,
                            endDate: req.body.endDate,
                            price: car.pricePerDay * durationReservation,
                            paymentStatus : req.body.paymentStatus,
                            paymentMethod : req.body.paymentMethod,
                            ReservationStatus : req.body.ReservationStatus
                        }
                        const newReservation = new Reservation(newReservationDetail);
                        newReservation.save((err, reservation) => {
                            if (err) {
                                res.status(500).json("Cannot create new reservation : " + err);
                            }
                            else {
                                res.status(201).json(reservation);
                            }
                        });
                    } else {
                        res.status(401).json("This car is not available for this period");
                    }
                } else {
                    res.status(401).json("Cannot find this car in our catalog");
                }
            } else {
                res.status(401).json("Cannot find customer account with this email");
            }
        } else {
            res.status(401).json("Cannot find your agent account");
        }
    } catch (err) {
        res.status(500).json("Error while creating new client reservation to database" + err);
    }
}   



/**
 * Check if a is car is available at a specific period
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const isThisCarAvaible = async (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    try {
        const agent = await isAgentExistAndPasswordCorrect(req.body.email, req.body.password);
        if (typeof agent === "object") {
            try {
                const car = await isCarIdValid(req.body.carID);
                const availability = await isCarAvailable(req.body.carID, req.body.startDate, req.body.endDate);
                if(typeof car === "object") {
                    if (availability) {
                        res.status(200).json("AVAILABLE - This car is available for this period");
                    } else {
                        res.status(401).json("NOT AVAILABLE - This car is not available for this period");
                    }
                } else { 
                    res.status(401).json("Cannot find this car in our catalog");
                }
            } catch (err) {
                res.status(500).json("Error while searching car availability" + err);
            }
        } else {
            res.status(401).json("Cannot find your agent account");
        }
    } catch (err) {
        res.status(500).json("Error while creating new client reservation to database" + err);
    }
}   


module.exports = {
    processReservation: processReservation,
    AddCarToCalatog: AddCarToCalatog,
    CheckIfClientIsRegistred: CheckIfClientIsRegistred,
    CreateReservationFromAgency: CreateReservationFromAgency,
    isThisCarAvaible: isThisCarAvaible
};



// const CreateReservationFromAgency = async (req, res) => {
//     const errors = validationResult(req);
  
//     if (!errors.isEmpty()) {
//       return res.status(400).send({ errors: errors.array() });
//     }

//     try {
//         const agent = await isAgentExistAndPasswordCorrect(req.body.email, req.body.password);
//         if (typeof agent === "object") {
//             res.status(200).json("Agent is registred");
//         } else {
//             res.status(401).json("Cannot find your agent account");
//         }
//     } catch (err) {
//         res.status(500).json("Error while creating new client reservation to database" + err);
//     }
// }   
