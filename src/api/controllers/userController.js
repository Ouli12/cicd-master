require('dotenv').config();
const User = require("../models/userModel");
const School = require('../models/schoolModel');
const jwt = require('jsonwebtoken');
const validator = require("validator");
const bcrypt = require('bcrypt');
const { capitalize, decryptPassword } = require('../utils/utils');

const JWT_TOKEN = process.env.JWT_TOKEN;

// #region Users

/**
 * Get a user from a specific school.
 * @param {*} req The request sent.
 * @param {*} res The response of the request.
 */
exports.get_school_user = async (req, res) => {
  try {
    User.findOne({associatedSchoolId: req.params.school_id}, (err, user) => {
      try{
        if (err) {
          throw 'Internal server error.';
        }
        else if (!user){
          throw 'Ressources not found'
        }
        else {
          // Remove password property from user object
          const newObjUser = {
            _id: user._id,
            email: user.email,
            name: user.name,
            associatedSchoolId: user.associatedSchoolId,
            __v: user.__v
          }
  
          res.status(200);
          res.json(newObjUser);
          console.log("User successfully retrieved");
        }
      }catch(err){
        res.status(500);
        res.json({
          message: err,
        });
      }
      
    });
  } catch(err) {
    res.status(500);
    res.json({
      message: err,
    });

  }
}

/**
 * Post a new user as an admin to the DataBase.
 * @param {*} req The request sent, where req.body will contains all data we'll need to do the post. 
 * @param {*} res The response of the request.
 */
exports.create_an_user = async(req, res) => {
  let statusCode = 201;

  const {email, password, name} = req.body;

  try {
    if(email && password && name) {
      /**
       * Check if the email property contains a valid value and if it's greatly formatted, using validator module
       */
      if (!validator.isEmail(req.body.email)) {
        statusCode = 400;
        throw "Email don't have the right format.";
      
      } else if (!req.body.password) {
        statusCode = 400;
        throw "You have to set a password.";
        
      } else {
        /**
         *  Encrypt the password using bcrypt module
         * */
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const userObj = {
          email : req.body.email,
          password: hashedPassword,
          name : capitalize(req.body.name),
          associatedSchoolId: req.params.school_id 
        };
        const new_user = new User(userObj);

        new_user.save((err, user) => {
          if (err) {
            statusCode = 500;
            res.json({
              message: 'Internal server error.'
            });

          } else {
            const newObjUser = {
              _id: user._id,
              email: user.email,
              name: user.name,
              associatedSchoolId: user.associatedSchoolId,
              __v: user.__v
            }

            res.status(statusCode);
            res.json(newObjUser);
            console.log("User successfully created.");
          }
        });
      }
    } else {
      throw 'All fields are required.';
    }
  } catch(err) {
    res.status(statusCode);
    res.json({
        message: err
    })
  }
}

/**
 * LogIn a user with his credentials, then return his account token and his associated school ID.
 * @param {*} req  The request sent, where req.body contains the user credentials.
 * @param {*} res  The response sent by the server.
 */

exports.login_an_user = (req, res) => {
  const {email, password} = req.body;
  console.log('email : ', email);
  console.log('password : ', password);

  try {
    if(email && password) {
      User.findOne({email: email},(err, user) => {
        if (err) {
          throw 'Wrong email and/or password.';
        } else if(!user) {
          // Can't use throw, otherwise it'll .. throw .. an Unhandled error
          res.status(403);
          res.json({
            message: "Wrong Email or/and password.",
          });
        }
        else {
          if (decryptPassword(req.body.password, user.password)) {
            jwt.sign({ email: user.email, associatedSchoolId: user.associatedSchoolId, role: "user" }, JWT_TOKEN, { expiresIn: "30 days" }, (err, token) => {
              if (err) {
                statusCode = 500;
                res.json({
                  message: 'Internal server error.'
                });
              }
              else {
                console.log('school id : ', user.associatedSchoolId)
                res.status(200);
                res.json({
                  schoolId: user.associatedSchoolId,
                  token: token
                });
              }
            })
          }
        }
      })
    } else {
      throw 'All fields are required.';
    }
  } catch (err) {
    res.status(400);
    console.log(err);
    res.json({
      message: err,
    });
  }
}

/**
 * Get a list of all users from any school.
 * @param {*} req The request sent.
 * @param {*} res The response sent by the server.
 */

exports.get_all_users_from_all_schools = (req, res) => {
  try {  
    User.find({}, (err, users) => {
      if (err) {
        throw 'Server internal error.';
      } else {
        const newUsersArr = [];

        users.forEach(user => {
          const newObjUser = {
            _id: user._id,
            email: user.email,
            name: user.name,
            associatedSchoolId: user.associatedSchoolId,
            __v: user.__v
          }
          newUsersArr.push(newObjUser);
          console.log(newObjUser);
        });

        res.status(200);
        res.json(newUsersArr);
      }
    })
  } catch (err) {
    res.status(500);
    console.log(err);
    res.json({
      message: err,
    });
  }
}