'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

let userSchema = new Schema({
  userId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    required:true
  },
  lastName: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required:true
  },
  email: {
    type: String,
    required:true
  },
  mobileNumber: {
    type: String,
    required:true
  },
  userName:{
    type:String,
    required:true
  },
  isAdmin:{
    type:Boolean,
    required:true
  }

})


mongoose.model('UserModel', userSchema);