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


const router = express.Router();

router.post("/register", asyncHandler(insert), login);
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  login
);
router.get(
  "/findme",
  test,
  passport.authenticate("jwt", { session: false }),
  login
);

router.put("/reset-request",
  async (req, res, next) => {
    try {
      await reset.resetRequest(req.email);
      res.stats(201).json({ message: "reset request sent" })
    } catch (err) {
      res.status(500).json({ message: "Error in reset request", error: err })
    }

  }
)

router.put("/reset-token",
  async (req, res, next) => {
    try {
      await reset.checkToken(req.token)
      res.stats(201).json({ message: "token valid" })
    } catch (err) {
      res.status(500).json({ message: "Error in validating token", error: err })
    }
  })

router.put("/reset-password",
  async (req, res, next) => {
    try {
      await reset.resetPassword(req.token, req.password)
      res.stats(201).json({ message: "reset password" })

    } catch (err) {
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

function test(req, res, next) {
  next();
}



function login(req, res) {
  const expiresIn = config.expiresIn;
  const user = req.user;
  const token = authController.generateToken(user);
  res.json({ user, token, expiresIn });
}

module.exports = router;
