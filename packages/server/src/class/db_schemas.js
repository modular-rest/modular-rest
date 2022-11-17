var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    'file': new Schema({
        originalName: String,
        fileName: String,
        owner: String,
        format: String,
        // Tag being used as the parent dir for files
        // uploaddir/$format/$tag/timestamp.format
        tag: String,
    })
}