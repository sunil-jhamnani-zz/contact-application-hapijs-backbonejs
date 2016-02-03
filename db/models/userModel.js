/**
 * Created by sunil.jhamnani on 1/17/16.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userModel = new mongoose.Schema({
    email: {type: String},
    password: {type: String}
});

module.exports = mongoose.model('users',userModel);