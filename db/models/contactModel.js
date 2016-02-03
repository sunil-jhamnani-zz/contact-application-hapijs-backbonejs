/**
 * Created by sunil.jhamnani on 1/16/16.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var contactModel = new Schema({
    name: {type: String},
    email: {type: String},
    phone: {type: String},
    skypeid: {type: String}
});

module.exports = mongoose.model("contacts",contactModel);
