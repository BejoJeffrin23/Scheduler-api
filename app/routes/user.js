const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require("./../../app/middlewares/auth")


module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;

    // defining routes.

  // params: firstName, lastName, email, mobileNumber, password
  app.post(`${baseUrl}/signup`, userController.signUpFunction);
  /**
      * @apiGroup User
      * @apiVersion 1.0.0
      * @api {post} /api/v1/users/signup SignUp User
      * 
      * @apiParam {String} firstName First name of the user. (body params) (required)
      * @apiParam {String} lastName lastName of the user. (body params) (required)
      * @apiParam {Number} number mobile number of the user. (body params) (required)
      * @apiParam {String} email email of the user. (body params) (required)
      * @apiParam {String} password password of the user. (body params) (required)
      *
      * @apiSuccess {object} myResponse shows error status, message, http status code, result.
      * 
      *  @apiSuccessExample {json} Success-Response:
      *  {
         "error": false,
         "message": "User created successfully",
         "status": 200,
         "data": {
                 email: "meetingscheduler1234@gmail.com"
                 firstName: "Check"
                 isAdmin: false
                 lastName: "Check"
                 mobileNumber: "971-999999999"
                 password: "223388"
                 userName: "Check-user"
                 }
             }
      * @apiErrorExample {json} Error-Response:
      *
      * {
         "error": true,
         "message": "Error message",
         "status": 500/404/403,
         "data": null
        }
     */



  // params: email, password.
  app.post(`${baseUrl}/login`, userController.loginFunction);
  /**
  * @apiGroup User
  * @apiVersion  1.0.0
  * @api {post} /api/v1/users/login user login.
  *
  * @apiParam {string} email email of the user. (body params) (required)
  * @apiParam {string} password password of the user. (body params) (required)
  *
  * @apiSuccess {object} myResponse shows error status, message, http status code, result.
  * 
  * @apiSuccessExample {object} Success-Response:
      {
         "error": false,
         "message": "Login Successful",
         "status": 200,
         "data": {
             "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
             "userDetails": {
              email: "bejojeffrin23@gmail.com"
              firstName: "Bejo"
              isAdmin: false
              lastName: "Jeffrin"
              mobileNumber: "376-944"
              userId: "WSa0F9ja"
              userName: "Bejo-user"
         }
     }
  }
     @apiErrorExample {json} Error-Response:
      *
      * {
         "error": true,
         "message": "Error message",
         "status": 500/404/403,
         "data": null
        }
     */


  app.post(`${baseUrl}/logout`,auth.isAuthorized, userController.logout);
  /**
  * @apiGroup User
  * @apiVersion  1.0.0
  * @api {post} /api/v1/users/logout to logout user.
  *    
  * @apiSuccess {object} myResponse shows error status, message, http status code, result.
  * 
  * @apiSuccessExample {object} Success-Response:
      {
         "error": false,
         "message": "Logged Out Successfully",
         "status": 200,
         "data": null

     }
     * @apiErrorExample {json} Error-Response:
     *
     * {
         "error": true,
         "message": "Error message",
         "status": 500/404/403,
         "data": null
        }
 */

app.get(`${baseUrl}/allUsers`, userController.getAllUser);
/**
* @apiGroup User
* @apiVersion 1.0.0
* @api {get} /api/users/allUsers Get all Users data
* @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
*
* @apiSuccess {object} myResponse shows error status, message, http status code, result.

*  @apiSuccessExample {json} Success-Response:
*  {
       "error": false,
       "message": "All users fetched successfully",
       "status": 200,
       "data": [ {
              email: "bejojeffrin23@gmail.com"
              firstName: "Bejo"
              isAdmin: false
              lastName: "Jeffrin"
              mobileNumber: "376-944"
              userId: "WSa0F9ja"
              userName: "Bejo-user"
         }]
                 
       }
   }
* @apiErrorExample {json} Error-Response:
*
* {
   "error": true,
   "message": "Error Occured",
   "status": 500/404,
   "data": null
  }
*/

app.post(`${baseUrl}/reset`,userController.sendMail)
/**'
     * @apiGroup User
     * @apiVersion 1.0.0
     * @api {post} /api/users/reset To send email with link to reset password
     *
     * @apiParam {String} email as Body parameter.
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     *
     *  @apiSuccessExample {json} Success-Response:
     *  {
            "error": false,
            "message": "Please click on the link sent to your registered email.",
            "status": 200,
            "data": "null(Email will be sent your registered email address with link to reset password)"
        }
    @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured",
	    "status": 500
	    "data": [ {
              email: "bejojeffrin23@gmail.com"
              firstName: "Bejo"
              isAdmin: false
              lastName: "Jeffrin"
              mobileNumber: "376-944"
              userId: "WSa0F9ja"
              userName: "Bejo-user"
         }]
	   }
    */

app.post(`${baseUrl}/:userId/change`,userController.changePassword)
/**'
     * @apiGroup User
     * @apiVersion 1.0.0
     * @api {post} /api/users/:userId/change To reset password
     *
     * @apiParam {String} password as Body parameter.
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     *
     *  @apiSuccessExample {json} Success-Response:
     *  {
            "error": false,
            "message": "Password changed successfully.",
            "status": 200,
            "data": "result"
        }
    @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured",
	    "status": 500
	    "data": null
	   }
    */


app.post(`${baseUrl}/create`,auth.isAuthorized,userController.create)
 /** 
     * @apiGroup Event
     * @apiVersion 1.0.0
     * @api {post} /api/v1/users/create Schedule an Event
     * 
     * @apiParam {string} title Title of the event. (body params) (required)
     * @apiParam {string} location location of the event. (body params) (required)
     * @apiParam {string} purpose Purpose of the event. (body params) (required)
     * @apiParam {string} color Color to show on calender. (body params) (required)
     * @apiParam {Date} start Date of event start. (body params) (required)
     * @apiParam {number} startHour Hour of event start. (body params) (required)
     * @apiParam {number} startMinute Minute of event start. (body params) (required)
     * @apiParam {Date} end Date of event end. (body params) (required)
     * @apiParam {number} endHour Hour of event end. (body params) (required)
     * @apiParam {number} endMinute Minute of event end. (body params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     *
     *  @apiSuccessExample {json} Success-Response:
     *  {
            "error": false,
            "message": "Event created successfully",
            "status": 200,
            "data": {
                        adminId: "1Po7901p"
                        adminName: "Anto Benister"
                        color: {primary: "#7c649b"}
                        createdOn: "2019-10-01T18:29:54.000Z"
                        end: Wed Oct 16 2019 23:59:59 GMT+0530 (India Standard Time) {}
                        endHour: 23
                        endMinute: 59
                        eventId: "7DAdTq8F"
                        location: "check"
                        modifiedOn: null
                        purpose: "check"
                        start: Sat Oct 05 2019 23:59:00 GMT+0530 (India Standard Time) {}
                        startHour: 23
                        startMinute: 59
                        title: "Check"
                        userId: "WJa0F9ja"
                    }
            }
     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured",
	    "status": 500/404,
	    "data": null
	   }
    */


app.get(`${baseUrl}/:userId/view`,auth.isAuthorized,userController.viewUserEvent)
/** 
     * @apiGroup Event
     * @apiVersion 1.0.0
     * @api {get} /api/v1/users/:userId/view Get All Events
     * 
     * @apiParam {string} userId Id of the user. (query params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     *  @apiSuccessExample {json} Success-Response:
     *  {
            "error": false,
            "message": "All events fetched successfully",
            "status": 200,
            "data": [{
                        adminId: "1Po7901p"
                        adminName: "Anto Benister"
                        color: {primary: "#7c649b"}
                        createdOn: "2019-10-01T18:29:54.000Z"
                        end: Wed Oct 16 2019 23:59:59 GMT+0530 (India Standard Time) {}
                        endHour: 23
                        endMinute: 59
                        eventId: "7DAdTq8F"
                        location: "check"
                        modifiedOn: null
                        purpose: "check"
                        start: Sat Oct 05 2019 23:59:00 GMT+0530 (India Standard Time) {}
                        startHour: 23
                        startMinute: 59
                        title: "Check"
                        userId: "WJa0F9ja"
                    }]
            }
     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured",
	    "status": 500/404,
	    "data": null
	   }
    */
    

app.get(`${baseUrl}/:eventId/viewevent`,auth.isAuthorized,userController.viewSingleEvent)
 /** 
     * @apiGroup Event
     * @apiVersion 1.0.0
     * @api {get} /api/v1/users/:eventId/getone Fetch a particular Event
     * 
     * @apiParam {string} eventId Id of the Event. (query params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     *
     *  @apiSuccessExample {json} Success-Response:
     *  {
            "error": false,
            "message": "Event fetched successfully",
            "status": 200,
            "data": {
                        adminId: "1Po7901p"
                        adminName: "Anto Benister"
                        color: {primary: "#7c649b"}
                        createdOn: "2019-10-01T18:29:54.000Z"
                        end: Wed Oct 16 2019 23:59:59 GMT+0530 (India Standard Time) {}
                        endHour: 23
                        endMinute: 59
                        eventId: "7DAdTq8F"
                        location: "check"
                        modifiedOn: null
                        purpose: "check"
                        start: Sat Oct 05 2019 23:59:00 GMT+0530 (India Standard Time) {}
                        startHour: 23
                        startMinute: 59
                        title: "Check"
                        userId: "WJa0F9ja"
                    }
            }
     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured",
	    "status": 500/404,
	    "data": null
	   }
    */


app.put(`${baseUrl}/:eventId/edit`,auth.isAuthorized, userController.editEvent);
 /** 
     * @apiGroup Event
     * @apiVersion 1.0.0
     * @api {put} /api/v1/users/:eventId/edit Edit an event
     * 
     * @apiParam {string} eventId Id of the event. (query params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     *
     *  @apiSuccessExample {json} Success-Response:
     *  {
            "error": false,
            "message": "Event edited successfully",
            "status": 200,
            "data": {
                        adminId: "1Po7901p"
                        adminName: "Anto Benister"
                        color: {primary: "#7c649b"}
                        createdOn: "2019-10-01T18:29:54.000Z"
                        end: Wed Oct 16 2019 23:59:59 GMT+0530 (India Standard Time) {}
                        endHour: 23
                        endMinute: 59
                        eventId: "7DAdTq8F"
                        location: "check"
                        modifiedOn: null
                        purpose: "check"
                        start: Sat Oct 05 2019 23:59:00 GMT+0530 (India Standard Time) {}
                        startHour: 23
                        startMinute: 59
                        title: "Check"
                        userId: "WJa0F9ja"
                    }
            }
     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured",
	    "status": 500/404,
	    "data": null
	   }
    */

    

app.post(`${baseUrl}/:eventId/delete`,auth.isAuthorized, userController.deleteEvent);
 /** 
     * @apiGroup Event
     * @apiVersion 1.0.0
     * @api {post} /api/v1/users/:eventId/delete Delete an event
     *
     * @apiParam {string} eventId Id of the event. (query params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     *  @apiSuccessExample {json} Success-Response:
     *  {
            "error": false,
            "message": "Event deleted successfully",
            "status": 200,
            "data": null
            }
     * @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error Occured",
	    "status": 500/404,
	    "data": null
	   }
    */



}
