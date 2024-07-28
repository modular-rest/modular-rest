const Mongoose = require('mongoose');

module.exports = {
  'ObjectId': Mongoose.Types.ObjectId,
  'Date': (dateValue) => {
      const strDate = dateValue.toString();
      const mongoDateFormateInString = new Date(strDate).toISOString().split('T')[0];
      return new Date(mongoDateFormateInString);
  }
}