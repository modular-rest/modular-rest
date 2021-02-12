var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    'file': new Schema({
        originalName: String,
        fileName: String,
        owner: String,
    })
}