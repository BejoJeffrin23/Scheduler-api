const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let eventSchema = new Schema({
    eventId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    startHour: {
        type: Number,
        required: true
    },
    startMinute: {
        type: Number,
        required: true
    },
    end: {
        type: Date,
        default: ''
    },
    endHour: {
        type: Number,
        required: true
    },
    endMinute: {
        type: Number,
        required: true
    },
    adminId: {
        type: String,
        required: true
    }, 
    adminName: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: '#1d71c5'
    },
    createdOn: {
        type: Date,
        required: true
    },
    modifiedOn: {
        type: Date,
        default: ''
    },
    purpose:{
        type:String,
        default:'Meeting'
    },
    location:{
        type:String,
        default:'location'
    }
});


module.exports = mongoose.model('EventModel', eventSchema);