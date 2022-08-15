const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    loginHistory: [
        {
            dateTime: {
                type: Date,
            },
            userAgent: {
                type: String,
            },
        },
    ],
});
let User;
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(
            "mongodb+srv://mongodb23:Ary@@2123@senecaweb.yc6saxv.mongodb.net/?retryWrites=true&w=majority"
        );

        db.on("error", (err) => {
            reject(err);
        });
        db.once("open", () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        console.log(userData);
        const { password, password2 } = userData;
        if (!(password === password2)) return reject("Passwords do not match ");
        let hashedPassword;
        bcrypt
            .hash(password, 10)
            .then((hash) => {
                userData.password = hash;
                let newUser = new User(userData);
                newUser
                    .save()
                    .then(() => {
                        return resolve();
                    })
                    .catch((err) => {
                        console.log(err);
                        if (err && err.code === 11000)
                            return reject("User Name already taken");
                        else if (err)
                            return reject("there was an error creating the user:", err);
                    });
            })
            .catch((err) => {
                return reject("here was an error encrypting the password");
            });

    });
};

module.exports.checkUser = function checkUser(userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .exec()
            .then((users) => {
                bcrypt.compare(userData.password, users[0].password).then((result) => {
                    console.log("result", result);
                    if (result === false)
                        return reject("Incorrect Password for user:", userData.userName);
                });
                users[0].loginHistory.push({
                    dateTime: new Date().toString(),
                    userAgent: userData.userAgent,
                });
                User.updateOne(
                    { userName: users[0].userName },
                    { $set: { loginHistory: users[0].loginHistory } }
                )
                    .exec()
                    .then((d) => {
                        resolve(users[0]);
                    })
                    .catch((err) => {
                        return reject("There was an error verifying the user:", err);
                    });
            })
            .catch((err) => {
                return reject("Unable to find user", userData.userName);
            });
    });
};