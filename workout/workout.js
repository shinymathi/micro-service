const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkoutSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Workout', WorkoutSchema);