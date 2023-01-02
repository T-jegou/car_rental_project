const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const { hashPassword, validatePassword } = require('../lib/tools');
const {userSchema} = require('../models/User');

const User = mongoose.model('User', userSchema);


/**
 * Create account.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const createAccount = async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  let userInfo = req.body;
  const newUser = new User(userInfo);

  newUser.password = await hashPassword(newUser.password);

  newUser.save((err, user) => {
    if (err) {
      res.status(500).json("Cannot create your account");
    } else {
      res.status(201).json(user._id);
    }
  });
}

/**
 * Get account informations.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getAccount = (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  User.findById(req.body.userID, async (err, user) => {
    if (err) {
        res.status(500).json("Cannot find your account");
    } else {
      if (await validatePassword(req.body.password, user.password)) {  
        res.status(200).json(user);
      } else {
        res.status(401).json("Unauthorized, WRONG PASSWORD");
      }
    }
  });
}


/**
 * Create account accout.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const updateAccount = (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  User.findById(req.body.userID, async (err, user) => {
    if (err) {
        res.status(500).json("Cannot find your account");
    } else {
      if (await validatePassword(req.body.password, user.password))  { 
        for(const field in req.body) {
          if (field != "password" && field != "userID") {
            user[field] = req.body[field];
          }
        };

        user.save((err, user) => {
          if (err) {
              res.status(500).json("Cannot update your account");
          } else {
            res.status(200).json(user);
          }
        });
      } else {
        res.status(401).json("Unauthorized, WRONG PASSWORD");
      }
    }
  });
}   

const deleteAccount = (req, res) => {
  res.send(200).json("Must be implemented");
  return true;
}

const getReservation = (req, res) => {
  res.send(200).json("Must be implemented")
  return true;
}

const getReservations = (req, res) => {
  res.send(200).json("Must be implemented");
  return true;
}


module.exports = {
    getReservations: getReservations,
    getReservation: getReservation,
    createAccount: createAccount,
    getAccount: getAccount,
    updateAccount: updateAccount,
    deleteAccount: deleteAccount
}


