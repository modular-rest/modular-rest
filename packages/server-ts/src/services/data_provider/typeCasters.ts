import mongoose from 'mongoose';

/**
 * Type casting functions for MongoDB types
 */
const TypeCasters = {
  // A function wrapping the class: casters are invoked without `new`, which the bson 6
  // ObjectId class rejects. A plain function still works if a caller does use `new`.
  ObjectId: function (value: string): mongoose.Types.ObjectId {
    return new mongoose.Types.ObjectId(value);
  },
  Date: (dateValue: string | Date): Date => {
    const strDate = dateValue.toString();
    const mongoDateFormateInString = new Date(strDate).toISOString().split('T')[0];
    return new Date(mongoDateFormateInString);
  },
};

export default TypeCasters;
