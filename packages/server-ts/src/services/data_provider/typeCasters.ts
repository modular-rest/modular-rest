import mongoose from 'mongoose';

/**
 * Type casting functions for MongoDB types
 */
const TypeCasters = {
  ObjectId: mongoose.Types.ObjectId,
  Date: (dateValue: string | Date): Date => {
    const strDate = dateValue.toString();
    const mongoDateFormateInString = new Date(strDate).toISOString().split('T')[0];
    return new Date(mongoDateFormateInString);
  },
};

export default TypeCasters;
