const express = require('express');
const router = express.Router();
const passport = require('passport');
const { User } = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/helper');

//Register
router.post('/user/register', async (req, res) => {
    try {
        const { body } = req;
        body.password = hashPassword(body.password);
        const newUser = new User(body);
        const savedUser = await newUser.save();
        return res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

//Login
router.post('/user/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error', error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: info.message });
        }

        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Login failed', error: err.message });
            }
            return res.status(200).json({ message: 'Login successful', user });
        });
    })(req, res, next);
});

//Check Auth
router.get('/user/status', (req, res) => {
    // console.log('CheckUserStatus');  
    // //console.log(req);
    // console.log(req.user);
    // console.log('session id')
    // console.log(req.session.id);
    return req.user ? res.json(req.user) : res.sendStatus(401);
})

//Logout
router.get('/user/logout', (req, res) => {
    req.logOut(err => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message })
        }
        res.json({ success: true })
    })
})



//UpdateInfo
router.put('/user/update', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const findUser = await User.findById(req.user._id);
        if (!comparePassword(req.body.password, findUser.password)) {
            return res.status(401).json({ message: "Wrong password" });
        }

        const { body: {
            firstName,
            lastName,
            age,
            gender,
            email
        } } = req;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { firstName, lastName, age, gender, email },
            { new: true, select: "-password" } // Exclude password from response
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
})

//Change password
router.put('/user/change-password', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized", success: false });
        }

        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (!comparePassword(oldPassword, user.password)) {
            return res.status(401).json({ message: "Incorrect old password", success: false });
        }

        user.password = hashPassword(newPassword);
        await user.save();

        res.status(200).json({ message: "Password changed successfully", success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

//Search user
router.get('/user/search', async (req, res) => {
    try {
        const { name } = req.query;
        const currentUserId = req.user.id; // Get the logged-in user's ID from the request

        let users;

        if (name) {
            users = await User.find({
                _id: { $ne: currentUserId }, // Exclude the logged-in user
                $expr: {
                    $regexMatch: {
                        input: { $concat: ["$firstName", " ", "$lastName"] },
                        regex: new RegExp(name, 'i'),
                    }
                }
            });
        } else {
            users = await User.find({ _id: { $ne: currentUserId } }); // Exclude the logged-in user
        }

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});






module.exports = router;