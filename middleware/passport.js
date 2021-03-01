const passport = require("passport");
const LocalStrategy = require("passport-local");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const config = require("../config/config");
const userController = require("../controller/user.controller");

const { RateLimiterMongo } = require('rate-limiter-flexible')
const maxWrongAttemptsByIpPerDay = 100;
const maxConsecutiveFailByUsernameAndIP = 10;
const mongo = require('../config/mongoose')

// const limiterSlowBruteByIP = new RateLimiterMongo({
//   storeClient: mongo.db,
//   keyPrefix: 'login_fail_attempts',
//   points: maxWrongAttemptsByIpPerDay,
//   duration: 60 * 60 * 3,
//   blockDuration: 60 * 15
// })



const localLogin = new LocalStrategy(
  {
    usernameField: "email",
  },
  async (email, password, done) => {
    if (config.debugMode) { console.log("New local login..."); }
    const user = await userController.getUserByEmailIdAndPassword(
      email,
      password
    );
    if (user) {
      console.log(user)
      if (user.active) {
        console.log("user is acive")
        return user
          ? done(null, user)
          : done(null, false, {
            error: "Your login details are not valid. Please try again",
          });
      }
      else {
        return done(null, false, {
          error: "Your account is not yet activated, please check your email"
        })
      }
    } else {
      console.log("User not found...")
      return done(null, false, {
        error: "Your login details are not valid. Please try again"
      })
    }
  }
);

const jwtLogin = new JwtStrategy(
  {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret,
  },
  async (payload, done) => {
    const user = await userController.getUserById(payload._id);

    return user
      ? done(null, user)
      : done(null, false, {
        error: "Your login details are not valid. Please try again",
      });


  }
);

module.exports = passport.use(localLogin).use(jwtLogin);
