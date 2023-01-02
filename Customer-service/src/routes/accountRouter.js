const express = require('express');
const {getReservations ,getReservation, createAccount, getAccount, updateAccount, deleteAccount} = require('../controllers/accountController');
const {validUserCreation, validGetInfosUser, validUpdateInfosUser, validDeleteUser} = require('../lib/validator');

const router = express.Router();

router.post('/create' , validUserCreation, createAccount);
router.get('/infos', validGetInfosUser,getAccount);
router.put('/update', validUpdateInfosUser, updateAccount);
router.delete('/delete', validDeleteUser, deleteAccount);
router.get('/reservation/:reservationID', getReservation);
router.get('/reservations', getReservations);


module.exports = {
    accountRouter: router
}