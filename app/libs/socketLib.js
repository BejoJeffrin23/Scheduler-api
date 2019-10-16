const socketio = require('socket.io');
const mongoose = require('mongoose');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const check = require('../libs/checkLib')
const tokenLib = require("./tokenLib.js");
const controller = require("../controllers/userController")


const EventModel = mongoose.model('EventModel')




let setServer = (server) => {

    let allOnlineUsers = []

    let io = socketio.listen(server);

    let myIo = io.of('/')

    myIo.on('connection', (socket) => {
        console.log("socket is connected")

        let currentUser;
        socket.emit("verifyUser", "");


        socket.on('set-user', (authToken) => {

            console.log("set-user called")
            tokenLib.verifyClaimWithoutSecret(authToken, (err, user) => {
                if (err) {
                    socket.emit('auth-error', { status: 500, error: 'Please provide correct auth token' })
                }
                else {

                    console.log("user is verified..setting details");
                    // setting socket user id 
                    let x = user.data
                    socket.userId = x.userId
                    let fullName = `${x.firstName} ${x.lastName}`
                    currentUser = {
                        userId: x.userId,
                        fullName: fullName,
                        isAdmin: x.isAdmin,
                        email: x.email
                    }
                    console.log(`--- inside getAllUsersInAHas function ---`)
                    console.log(`${fullName} is online`);

                    allOnlineUsers.push(currentUser)
                    // setting room name
                    socket.room = 'notifyUser'
                    // joining chat-group room.
                    socket.join(socket.room)
                    socket.to(socket.room).broadcast.emit('online', allOnlineUsers)


                    console.log(allOnlineUsers)
                }
            })
        }) // end of listening set-user event

// event created soket functions
        socket.on('event-created', (adminName, userId, title) => {
            data = { adminName: adminName, userId: userId, title: title }
            controller.sendCreatedMail(data.userId, data.title)
            myIo.emit('event-created-notification', data);
        });

        // event edited soket functions
        socket.on('event-edited', (adminName, userId, title) => {
            data = { adminName: adminName, userId: userId, title: title }
            controller.sendEditedMail(data.userId, data.title)
            myIo.emit('event-edited-notification', data);
        });

        
// event deleted soket functions
        socket.on('event-deleted', (adminName, userId, title) => {
            data = { adminName: adminName, userId: userId, title: title }

            controller.sendDeletedMail(data.userId, data.title)
            myIo.emit('event-deleted-notification', data);
        });


//function for socket alarm

        setInterval(function () {
                EventModel.find()
                .select(' -__v -_id')
                    .lean()
                    .exec((err, result) =>{
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'User Controller: getAllEvents', 10)
                        } else if (check.isEmpty(result)) {
                            logger.info('No Event Found', 'User Controller: getAllEvents')
                        } else {
                            let min= new Date().getMinutes()
                           let hours= new Date().getHours()
                           let month= new Date().getMonth()
                           let day= new Date().getDay()

                            for (let x of result){
                                m = (new Date(x.start).getMonth())
                                d = (new Date(x.start).getDay())                        
                                if (min-30 == x.startMinute-30 && hours-5 == x.startHour-5 && month == m && day == d) {
                                console.log(x.userId)
                                controller.sendAlarmMail(x.userId, x.title, x.adminName)
                                data = { adminName: x.adminName, userId: x.userId, title: x.title }
                                myIo.emit('alarm', data);

                            }}

                        }
                    })
            
        }, 59000)



        socket.on('disconnect', () => {
            let removeIndex = allOnlineUsers.map((user) => { return user.userId }).indexOf(socket.userId);
            allOnlineUsers.splice(removeIndex, 1);

            //refreshing and emitting new online users list
            socket.to(socket.room).broadcast.emit('online', allOnlineUsers);
            socket.leave(socket.room);
            console.log('disconnected')
            console.log(allOnlineUsers)
        });//end of disconnect event


    }


    )
}


module.exports = {
    setServer: setServer
}