import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User';

// Create a passport middleware to handle user registration
passport.use('register', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // Save the information provided by the user to the the database
    const existsAlready = await User.findOne({ email });
    if (!existsAlready) {
      return await User.create({ email, password })
        .then(user => done(null, false, user)).catch((err) => {
          done(null, false, { message: err.errors.email.message });
        });
      // Send the user information to the next middleware
    }
    return done(null, false, { message: 'Email Already Registered' });
  } catch (error) {
    return done(error);
  }
}));

// Create a passport middleware to handle User login
passport.use('login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // Find the user associated with the email provided by the user
    const user = await User.findOne({ email });
    if (!user) {
      // If the user isn't found in the database, return a message
      return done(null, false, { message: 'User not found' });
    }
    // Validate password and make sure it matches with the corresponding hash stored in the database
    // If the passwords match, it returns a value of true.
    const validate = await user.isValidPassword(password);
    if (!validate) {
      return done(null, false, { message: 'Wrong Password' });
    }
    // Send the user information to the next middleware
    return done(null, user, { message: 'Logged in Successfully' });
  } catch (error) {
    return done(error);
  }
}));

// This verifies that the token sent by the user is valid
passport.use(new JwtStrategy({
  // secret we used to sign our JWT
  secretOrKey: 'top_secret',
  // we expect the user to send the token as a query paramater with the name 'secret_token'
  jwtFromRequest: ExtractJwt.fromUrlQueryParameter('secret_token')
}, async (token, done) => {
  try {
    // Pass the user details to the next middleware
    return done(null, token.user);
  } catch (error) {
    done(error);
  }
}));
