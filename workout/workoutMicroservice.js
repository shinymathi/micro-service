const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Workout = require('./workout');
const User = require('../user/user');

const PROTO_PATH = __dirname + '/workout.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const workoutProto = grpc.loadPackageDefinition(packageDefinition).workout;

mongoose.connect('mongodb://localhost:27017/fitness', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const server = new grpc.Server();

server.addService(workoutProto.WorkoutService.service, {
  GetWorkout: async (call, callback) => {
    try {
      const workout = await Workout.findById(call.request.id).populate('user');
      if (!workout) {
        return callback(new Error('Workout not found'));
      }
      callback(null, { id: workout.id, title: workout.title, description: workout.description, userId: workout.user.id });
    } catch (err) {
      callback(err);
    }
  },
  CreateWorkout: async (call, callback) => {
    try {
      const user = await User.findById(call.request.userId);
      if (!user) {
        return callback(new Error('User not found'));
      }
      const workout = new Workout({ title: call.request.title, description: call.request.description, user });
      await workout.save();
      callback(null, { id: workout.id, title: workout.title, description: workout.description, userId: user.id });
    } catch (err) {
      callback(err);
    }
  },
  UpdateWorkout: async (call, callback) => {
    try {
      const user = await User.findById(call.request.userId);
      if (!user) {
        return callback(new Error('User not found'));
      }
      const workout = await Workout.findByIdAndUpdate(
        call.request.id,
        { title: call.request.title, description: call.request.description, user },
        { new: true }
      ).populate('user');
      if (!workout) {
        return callback(new Error('Workout not found'));
      }
      callback(null, { id: workout.id, title: workout.title, description: workout.description, userId: workout.user.id });
    } catch (err) {
      callback(err);
    }
  },
  DeleteWorkout: async (call, callback) => {
    try {
      const workout = await Workout.findByIdAndDelete(call.request.id);
      if (!workout) {
        return callback(new Error('Workout not found'));
      }
      callback(null, { id: workout.id, title: workout.title, description: workout.description, userId: workout.user.id });
    } catch (err) {
      callback(err);
    }
  },
});

server.bindAsync('localhost:50052', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Workout gRPC service running at localhost:50052');
  server.start();
});
