const socketio = require('socket.io');
const mongoose = require('mongoose');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const tokenLib = require("./tokenLib.js");
const controller=require("../controllers/userController")

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
                    let x=user.data
                    socket.userId = x.userId
                    let fullName = `${x.firstName} ${x.lastName}`
                    currentUser = {
                        userId: x.userId,
                        fullName: fullName,
                        isAdmin:x.isAdmin,
                        email:x.email
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


        socket.on('event-created', (adminName,userId,title) => {
            data={adminName:adminName,userId:userId,title:title}
            console.log(allOnlineUsers)
            for(let x of allOnlineUsers){console.log(x.userId)
                if(data.userId!==x.userId){
controller.sendCreatedMail(data.userId,data.title)
                }
}
            socket.broadcast.emit('event-created-notification',data);
        });

        socket.on('event-edited', (adminName,userId,title) => {
            console.log('edit called')
            data={adminName:adminName,userId:userId,title:title}
            for(let x of allOnlineUsers){console.log(x.userId)
                if(data.userId!==x.userId){
controller.sendEditedMail(data.userId,data.title)
                }else {console.log("user online")}
}
            socket.broadcast.emit('event-edited-notification',data);
        });
    
        socket.on('alarm', (data) => {

           console.log(data)
           
            myIo.emit('alarm-notification',data);
        });

        socket.on('event-deleted', (adminName,userId,title) => {
            data={adminName:adminName,userId:userId,title:title}
            for(let x of allOnlineUsers){console.log(x.userId)
                if(data.userId!==x.userId){
controller.sendDeletedMail(data.userId,data.title)
                }else {console.log('user online')}
}            socket.broadcast.emit('event-deleted-notification',data);
        });
    

        socket.on('disconnect', () => {
            let removeIndex = allOnlineUsers.map((user) => {return user.userId}).indexOf(socket.userId);
            allOnlineUsers.splice(removeIndex, 1);

            //refreshing and emitting new online users list
            socket.to(socket.room).broadcast.emit('online', allOnlineUsers);
            socket.leave(socket.room);
console.log('disconnected')
console.log(allOnlineUsers)
        });//end of disconnect event

        
    
    
    }
    
    )}


    module.exports={
        setServer:setServer
    }