/**
 * Defines the user controller module
 * @module controller/user
 */

const User = require("../models/user.model");
const bcrypt = require("bcryptjs");




/**
 * Inserts new user into the database
 * @param {User} user 
 * @returns {User} The user from the return of saving the user to the database
 */
async function insert(user) {
  // make mongoose call to save user in db
  user.hashedPassword = bcrypt.hashSync(user.password, 10);
  delete user.password;

  console.log(`saving user to db`, user);
  return await new User(user).save().catch((error) => {
    console.log("FOUND ERROR", error.code);
    if (error.code == 11000) error = new Error("Email already registered");
    throw error;
  });
}

/**
 * Checks if a user is valid
 * @param {User} user 
 * @param {String} password 
 * @param {String} hashedPassword 
 * @returns {Promise<Boolean | void>} Result of comparing the password with the encrypted version in the database if there's a user
 */
async function isUserValid(user, password, hashedPassword) {
  return (
    user &&
    (await bcrypt.compare(password, hashedPassword).catch((err) => {
      res.status(400).json({ message: "Authorization failed", error: err });
    }))
  );
}

/**
 * Find a user from the database given an email and a password
 * @param {String} email 
 * @param {String} password 
 * @returns {User | null} if a user is found, return the user
 */
async function getUserByEmailIdAndPassword(email, password) {
  let user = await User.findOne({ email }).catch((err) => {
    res
      .status(500)
      .json({ message: "An error in finding the model occurred", error: err });
  });
  if (user) {
    if (
      await isUserValid(user, password, user.hashedPassword).catch((err) => {
        res.status(500).json({
          message: "An error in validating the user occurred",
          error: err,
        });
      })
    ) {
      user = user.toObject();
      delete user.hashedPassword;
      return user;
    } else {
      return null;
    }
  } else return null;
}

/**
 * Gets a user from the database by their ID
 * @param {String} id User's id
 * @returns {User | null} if a user is found, returns the user, otherwise returns null
 */
async function getUserById(id) {
  let user = await User.findById(id).catch((err) => {
    res
      .status(500)
      .json({ message: "An error in finding the user occurred", error: err });
  });
  // console.log("findById(): User = ", user);
  if (user) {
    user = user.toObject();
    delete user.hashedPassword;
    return user;
  } else {
    return null;
  }
}

/**
 * Gets a user from the database by their email address
 * @param {String} email User's email address
 * @returns {User | null} If a user is found, returns the user, otherwise returns null
 */
async function getUserByEmail(email) {
  let user = await User.findOne({ email }).catch((err) => {
    res
      .status(500)
      .json({ message: "An error in finding the user occurred", error: err });
  });
  if (user) {
    user = user.toObject();
    delete user.hashedPassword;
    return user;
  } else {
    return null;
  }
}

module.exports = {
  insert,
  getUserByEmailIdAndPassword,
  getUserById,
  getUserByEmail,
};
