/**
 * Defines the authentication route
 * @module route/auth
 */
const express = require("express");
const asyncHandler = require("express-async-handler");

const config = require("../config/config");
const userController = require("../controller/user.controller");
const authController = require("../controller/auth.controller");
const cartController = require("../controller/cart.controller.js");
const activationController = require("../controller/activation.controller");
const passport = require("../middleware/passport");
const activate = require("../controller/activation.controller")
const reset = require("../controller/reset.controller")
const email = require("../controller/email.controller")


const router = express.Router();

router.post("/register", asyncHandler(insert), (req, res, next) => {
  res.status(201).json("registration complete")
});

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  login
);

router.get(
  "/findme",
  passport.authenticate("jwt", { session: false }),
  login
);

router.put("/reset-request",
  async (req, res, next) => {
    try {
      console.log("Reset Password Request...")
      console.log(req.body)
      await reset.resetRequest(req.body.email);
      console.log("Completed request")
      res.status(201).json({ message: "reset request sent" })
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Error in reset request", error: err })
    }

  }
)

router.put("/reset-token",
  async (req, res, next) => {
    try {
      await reset.checkToken(req.body.token)
      res.status(201).json({ message: "token valid" })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Error in validating token", error: err })
    }
  })

router.put("/reset-password",
  async (req, res, next) => {
    try {
      console.log("Resetting Password...")
      let resetObj = await reset.checkToken(req.body.token)
      await reset.resetPassword(req.body.password, resetObj)
      res.status(201).json({ message: "reset password" })

    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Error in resetting password", error: err })
    }
  })

router.get(
  "/activate/:str",
  async (req, res, next) => {
    console.log("Activating...")
    try {
      await activate.activateAccount(req.params.str)
      res.status(200).json({
        text: "Successfully activated!"
      })
    } catch (err) {
      res.status(500).json({
        text: "Internal server error",
        error: err
      })
    }
  }
)

router.put(
  "/resendActivation", async (req, res, next) => {
    try {
      await activationController.resendActivation(req.body.email);
      console.log("Resend success")
      res.status(201).json({ message: "Verification email resend success" })
    } catch (err) {
      console.error(err)
      res.status(501).json({ message: "Internal server error", error: err })

    }
  }
)

/**
 * Inserts user into database and creates activation and cart for the user
 * @param {Request} req 
 * @param {Response} res 
 * @param {any} next 
 * @returns {void}
 */
async function insert(req, res, next) {
  const savedUser = req.body;

  await userController
    .insert(savedUser)
    .then(async (user) => {
      if (user) {
        req.user = user;
        foundUser = await userController.getUserByEmail(req.user.email);
        req.user = foundUser;
        cartController.createCart(foundUser._id);
        activationController.createActivation(req.user);
        next();
      } else {
        res.status(500).json({ message: "User does not exist!" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
}

/**
 * Generates the token and gives login successful response with user object, token, and expiration
 * @param {Request} req 
 * @param {Response} res 
 */
function login(req, res) {
  const expiresIn = config.expiresIn;
  const user = req.user;
  const token = authController.generateToken(user);
  res.json({ user, token, expiresIn });
}

module.exports = router;
