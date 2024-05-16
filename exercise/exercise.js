const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExerciseSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  workoutId: { type: Schema.Types.ObjectId, ref: 'Workout', required: true }
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
