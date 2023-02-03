const { check } = require('express-validator');

exports.validAddCarToCatalog = [
    check('email').exists(),
    check('password').exists(),
    check("brand").exists(),
    check("model").exists(),
    check("numberOfSeat").exists(),
    check("pricePerDay").exists(),
    check("available").exists()
]

exports.validCheckCustomer = [
    check('email').exists(),
    check('password').exists(),
    check('customerEmail').exists(),
]

exports.validCreateReservation = [
    check('email').exists(),
    check('password').exists(),
    check('carID').exists(),
    check('customerEmail').exists(),
    check('startDate').exists(),
    check('endDate').exists(),
    check('paymentStatus').exists(),
    check('ReservationStatus').exists(),
]

exports.validIsAvailable = [
    check('email').exists(),
    check('password').exists(),
    check('carID').exists(),
    check('startDate').exists(),
    check('endDate').exists(),
]

exports.validIsAgent = [
    check('email').exists(),
    check('password').exists(),
]