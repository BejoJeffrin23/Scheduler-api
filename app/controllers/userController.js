const mongoose = require('mongoose');
const nodemailer = require('nodemailer')
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const passwordLib = require('../libs/generatePasswordLib');
const token = require('../libs/tokenLib');


/* Models */
const UserModel = mongoose.model('UserModel')
const AuthModel = mongoose.model('AuthModel')
const EventModel = mongoose.model('EventModel')


// start user signup function 

let signUpFunction = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does not met the requirement', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, '"password" parameter is missing"', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate user input
    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            isAdmin: req.body.isAdmin,
                            userName: req.body.userName
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();


                                resolve(newUserObj)
                            }
                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }// end create user function
    let generateToken = (userDetails) => {
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }
    let saveToken = (tokenDetails) => {
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails

                            }
                            console.log(responseBody)
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }


    validateUserInput(req, res)
        .then(createUser)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created successfully', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end user signup function 



// start of login function 
let loginFunction = (req, res) => {
    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                console.log(req.body);
                UserModel.findOne({ email: req.body.email }, (err, userDetails) => {
                    /* handle the error here if the User is not found */
                    if (err) {
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        /* generate the error message and the api response message here */
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        /* generate the response and the console error message here */
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        /* prepare the message and the api response here */
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });

            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }
    let validatePassword = (retrievedUserDetails) => {
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }

    let generateToken = (userDetails) => {
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }
    let saveToken = (tokenDetails) => {
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails

                            }
                            console.log(responseBody)
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }

    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
}

// end of the login function 




const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: false,
    pool: true,
    service: "gmail",
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: 'meetingscheduler1234@gmail.com',
        pass: 'schedule'
    }
});

//start of send mail to reset password
let sendMail = (req, res) => {
    if (req.body.email) {
        console.log(req.body);
        UserModel.findOne({ email: req.body.email }, (err, userDetails) => {
            /* handle the error here if the User is not found */
            if (err) {
                logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                /* generate the error message and the api response message here */
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(userDetails)) {
                /* generate the response and the console error message here */
                logger.error('No User Found', 'userController: findUser()', 7)
                let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                res.send(apiResponse)
            } else {
                /* prepare the message and the api response here */
                logger.info('User Found', 'userController: findUser()', 10)
                let apiResponse = response.generate(false, 'User Details Found', 200, userDetails)
                res.send(apiResponse)


                let mailOptions = {
                    from: '"Scheduler"',
                    to: userDetails.email,
                    subject: '"Welcome to Scheduler"',
                    html: `<h2>Link to reset password</h2><br><h4>You have recieved the link to change the password.<a href="http://ec2-13-234-217-245.ap-south-1.compute.amazonaws.com/${userDetails.userId}/change">Click here...</a></h4>`
                }
                sgMail.send(msg);

                transporter.sendMail(mailOptions, function (err, data) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log('Reset Code send successfully')
                    }
                })

            }
        });

    } else {
        let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
        reject(apiResponse)
    }
}
//end of send mail function for resetting password

//function to send mail to user on editing an event
let sendEditedMail = (userId, title) => {
    if (userId) {
        UserModel.findOne({ userId: userId }, (err, userDetails) => {
            /* handle the error here if the User is not found */
            if (err) {
                logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                /* generate the error message and the api response message here */
            } else if (check.isEmpty(userDetails)) {
                /* generate the response and the console error message here */
                logger.error('No User Found', 'userController: findUser()', 7)
            } else {
                /* prepare the message and the api response here */
                logger.info('User Found', 'userController: findUser()', 10)

                let mailOptions = {
                    from: '"Scheduler"',
                    to: userDetails.email,
                    subject: '"Welcome to Scheduler"',
                    html: `<h2>Event Edited</h2><br><h4>There is a small change in the scheduled event ${title}</h4>`
                }

                transporter.sendMail(mailOptions, function (err, data) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log('mail for edit send successfully')
                    }
                })

            }
        });

    } else {
        let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
        reject(apiResponse)
    }
}

//end offunction to send mail to user on editing an event


//function to send mail for event deleted
let sendDeletedMail = (userId, title) => {
    if (userId) {
        UserModel.findOne({ userId: userId }, (err, userDetails) => {
            /* handle the error here if the User is not found */
            if (err) {
                logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                /* generate the error message and the api response message here */
            } else if (check.isEmpty(userDetails)) {
                /* generate the response and the console error message here */
                logger.error('No User Found', 'userController: findUser()', 7)
            } else {
                /* prepare the message and the api response here */
                logger.info('User Found', 'userController: findUser()', 10)

                let mailOptions = {
                    from: '"Scheduler"',
                    to: userDetails.email,
                    subject: '"Welcome to Scheduler "',
                    html: `<h2>Event cancelled</h2><br><h4>The scheduled event ${title} is cancelled </h4>`

                }
                transporter.sendMail(mailOptions, function (err, data) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log('mail for delete sent successfully')
                    }
                })

            }
        });

    } else {
        let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
        reject(apiResponse)
    }
}
//end of mail during event deletion function


//function to send mail on  start time of event

let sendAlarmMail = (userId, title, name) => {
    if (userId) {
        UserModel.findOne({ userId: userId }, (err, userDetails) => {
            /* handle the error here if the User is not found */
            if (err) {
                logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                /* generate the error message and the api response message here */
            } else if (check.isEmpty(userDetails)) {
                /* generate the response and the console error message here */
                logger.error('No User Found', 'userController: findUser()', 7)
            } else {
                /* prepare the message and the api response here */
                logger.info('User Found', 'userController: findUser()', 10)

                let mailOptions = {
                    from: '"Scheduler"',
                    to: userDetails.email,
                    subject: '"Welcome to Scheduler "',
                    html: `<h2>Event started</h2><br><h4>The scheduled event ${title} by  ${name} has started </h4>`

                }
                transporter.sendMail(mailOptions, function (err, data) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log('Mail for alarm successfully')
                    }
                })

            }
        });

    } else {
        let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
        reject(apiResponse)
    }
}
////function to send mail on start time of event 


//function to send mail on event creation
let sendCreatedMail = (userId, title) => {
    if (userId) {
        UserModel.findOne({ userId: userId }, (err, userDetails) => {
            /* handle the error here if the User is not found */
            if (err) {
                logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                /* generate the error message and the api response message here */
            } else if (check.isEmpty(userDetails)) {
                /* generate the response and the console error message here */
                logger.error('No User Found', 'userController: findUser()', 7)
            } else {
                /* prepare the message and the api response here */
                logger.info('User Found', 'userController: findUser()', 10)

                let mailOptions = {
                    from: '"Scheduler"',
                    to: userDetails.email,
                    subject: '"Welcome to Scheduler"',
                    html: `<h2>Event scheduled</h2><br><h4>The event ${title} has been scheduled </h4>`

                }
                transporter.sendMail(mailOptions, function (err, data) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log('Mail for create sent successfully')
                    }
                })

            }
        });

    } else {
        let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
        reject(apiResponse)
    }
}
//end of function to send mail on event creation


//start of change password function
let changePassword = (req, res) => {
    UserModel.findOne({ 'userId': req.params.userId })
        .exec((err, result) => {
            if (err) {
                console.log(err)
                let apiResponse = response.generate(true, 'error', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, 'Event not found', 404, null)
                res.send(apiResponse)
            } else {
                result.password = passwordLib.hashpassword(req.body.password),
                    console.log(req.body)
                console.log(result)
                result.save(function (err, result) {
                    if (err) {
                        console.log(err)
                        let apiResponse = response.generate(true, 'error at save', 500, null)
                        res.send(apiResponse)
                    } else {
                        let apiResponse = response.generate(false, 'password changed successfull', 200, result)
                        res.send(apiResponse)
                    }
                })

            }
        })
}
//end of change password function

// start of log-out function

let logout = (req, res) => {
    AuthModel.findOneAndRemove({ userId: req.user.userId }, (err, result) => {
        if (err) {
            console.log(err)
            logger.error(err.message, 'user Controller: logout', 10)
            let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
            res.send(apiResponse)
        }
    })
} // end of the logout function.


//function to get all users
let getAllUser = (req, res) => {
    UserModel.find()
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getAllUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller: getAllUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all users





//start of create event function

let create = (req, res) => {

    let newEvent = new EventModel({
        eventId: shortid.generate(),
        title: req.body.title,
        start: req.body.start,
        end: req.body.end,
        startHour: req.body.startHour,
        startMinute: req.body.startMinute,
        endHour: req.body.endHour,
        endMinute: req.body.endMinute,
        adminId: req.body.adminId,
        adminName: req.body.adminName,
        userId: req.body.userId,
        color: req.body.color,
        createdOn: time.now(),
        purpose: req.body.purpose,
        location: req.body.location
    })

    newEvent.save((err, result) => {
        if (err) {
            console.log(err)
            logger.error(`Error occured : ${err}`, 'Database', 10)
            let apiResponse = response.generate(true, 'Failed to register Event', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'Event not found', 404, null)
            res.send(apiResponse)
        } else {
            console.log(result)
            let apiResponse = response.generate(false, 'Event created', 200, result)
            res.send(apiResponse)
        }
    })
}
//end of create event function




//function to delete an Event 
let deleteEvent = (req, res) => {
    EventModel.remove({ 'eventId': req.params.eventId }, (err, result) => {
        if (err) {
            let apiResponse = response.generate(true, 'error', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'no Event found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = response.generate(false, 'Event deleted successfully', 200, result)
            res.send(apiResponse)
        }
    })
}
//end of delete Event function

let viewSingleEvent = (req, res) => {
    EventModel.findOne({ 'eventId': req.params.eventId })
        .exec((err, result) => {
            if (err) {
                console.log(err)
                let apiResponse = response.generate(true, 'error', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, 'events not found', 404, null)
                res.send(apiResponse)
            } else {
                console.log(result)
                let apiResponse = response.generate(false, 'Events fetched successfully', 200, result)
                res.send(apiResponse)
            }
        })
}

//function to edit an Event
let editEvent = (req, res) => {
    let options = req.body;
    EventModel.update({ 'eventId': req.params.eventId }, options, { multi: true })
        .exec(
            (err, result) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'error', 500, null)
                    res.send(apiResponse)
                } else if (check.isEmpty(result)) {
                    let apiResponse = response.generate(true, 'Event not found', 404, null)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'Event edited successfully', 200, result)
                    res.send(apiResponse)
                }
            }
        )
}
//end of edit Event function

//function to fetch events of single user
let viewUserEvent = (req, res) => {
    EventModel.find({ 'userId': req.params.userId })
        .exec((err, result) => {
            if (err) {
                console.log(err)
                let apiResponse = response.generate(true, 'error', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, 'events not found', 404, null)
                res.send(apiResponse)
            } else {
                console.log(result)
                let apiResponse = response.generate(false, 'Events fetched successfully', 200, result)
                res.send(apiResponse)
            }
        })
}
//end of view single Event function 


module.exports = {

    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout,
    getAllUser: getAllUser,
    sendMail: sendMail,
    changePassword: changePassword,
    create: create,
    viewUserEvent: viewUserEvent,
    editEvent: editEvent,
    viewSingleEvent: viewSingleEvent,
    deleteEvent: deleteEvent,
    sendCreatedMail: sendCreatedMail,
    sendEditedMail: sendEditedMail,
    sendDeletedMail: sendDeletedMail,
    sendAlarmMail: sendAlarmMail,



}// end exports