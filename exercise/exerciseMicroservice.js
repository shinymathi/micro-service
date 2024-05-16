const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Exercise = require('./exercise');
const Workout = require('../workout/workout');

const PROTO_PATH = __dirname + '/exercise.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const exerciseProto = grpc.loadPackageDefinition(packageDefinition).exercise;

mongoose.connect('mongodb://localhost:27017/fitness', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const server = new grpc.Server();

server.addService(exerciseProto.ExerciseService.service, {
  GetExercise: async (call, callback) => {
    try {
      const exercise = await Exercise.findById(call.request.id).populate('workout');
      if (!exercise) {
        return callback(new Error('Exercise not found'));
      }
      callback(null, { id: exercise.id, name: exercise.name, description: exercise.description, workoutId: exercise.workout.id });
    } catch (err) {
      callback(err);
    }
  },
  CreateExercise: async (call, callback) => {
    try {
      const workout = await Workout.findById(call.request.workoutId);
      if (!workout) {
        return callback(new Error('Workout not found'));
      }
      const exercise = new Exercise({ name: call.request.name, description: call.request.description, workout });
      await exercise.save();
      callback(null, { id: exercise.id, name: exercise.name, description: exercise.description, workoutId: workout.id });
    } catch (err) {
      callback(err);
    }
  },
  UpdateExercise: async (call, callback) => {
    try {
      const workout = await Workout.findById(call.request.workoutId);
      if (!workout) {
        return callback(new Error('Workout not found'));
      }
      const exercise = await Exercise.findByIdAndUpdate(
        call.request.id,
        { name: call.request.name, description: call.request.description, workout },
        { new: true }
      ).populate('workout');
      if (!exercise) {
        return callback(new Error('Exercise not found'));
      }
      callback(null, { id: exercise.id, name: exercise.name, description: exercise.description, workoutId: exercise.workout.id });
    } catch (err) {
      callback(err);
    }
  },
  DeleteExercise: async (call, callback) => {
    try {
      const exercise = await Exercise.findByIdAndDelete(call.request.id);
      if (!exercise) {
        return callback(new Error('Exercise not found'));
      }
      callback(null, { id: exercise.id, name: exercise.name, description: exercise.description, workoutId: exercise.workout.id });
    } catch (err) {
      callback(err);
    }
  },
});

server.bindAsync('localhost:50053', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Exercise gRPC service running at localhost:50053');
  server.start();
});
