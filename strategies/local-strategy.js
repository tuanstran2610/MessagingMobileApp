const passport = require('passport');
const { Strategy } = require('passport-local');
const { User } = require('../models/User');
const { comparePassword } = require('../utils/helper');

passport.serializeUser((user, done) => {
    // console.log('Serialize function');
    // console.log(user);
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    // console.log('Deserialize function');
    // console.log(id);
    try {
        const findUser = await User.findById(id);
        if (!findUser) {
            throw new Error('User not found');
        }
        done(null, findUser);
    } catch (error) {
        done(error, null);
    }
})

passport.use(
    new Strategy(async (username, password, done) => {
        //console.log(`Passport use (Before Serialize)`);
        try {
            const findUser = await User.findOne({ username });
            if (!findUser) {
                throw new Error('User not found');
            }
            if (!comparePassword(password, findUser.password)) {
                throw new Error('Wrong password');

            }
            done(null, findUser);
        } catch (error) {
            done(error, null);
        }
    })
)

module.exports = passport;
