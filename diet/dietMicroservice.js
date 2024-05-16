const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Diet = require('./diet');
const User = require('../user/user');

const PROTO_PATH = __dirname + '/diet.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const dietProto = grpc.loadPackageDefinition(packageDefinition).diet;

mongoose.connect('mongodb://localhost:27017/fitness', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const server = new grpc.Server();

server.addService(dietProto.DietService.service, {
  GetDiet: async (call, callback) => {
    try {
      const diet = await Diet.findById(call.request.id).populate('user');
      if (!diet) {
        return callback(new Error('Diet not found'));
      }
      callback(null, { id: diet.id, title: diet.title, description: diet.description, userId: diet.user.id });
    } catch (err) {
      callback(err);
    }
  },
  CreateDiet: async (call, callback) => {
    try {
      const user = await User.findById(call.request.userId);
      if (!user) {
        return callback(new Error('User not found'));
      }
      const diet = new Diet({ title: call.request.title, description: call.request.description, user });
      await diet.save();
      callback(null, { id: diet.id, title: diet.title, description: diet.description, userId: user.id });
    } catch (err) {
      callback(err);
    }
  },
  UpdateDiet: async (call, callback) => {
    try {
      const user = await User.findById(call.request.userId);
      if (!user) {
        return callback(new Error('User not found'));
      }
      const diet = await Diet.findByIdAndUpdate(
        call.request.id,
        { title: call.request.title, description: call.request.description, user },
        { new: true }
      ).populate('user');
      if (!diet) {
        return callback(new Error('Diet not found'));
      }
      callback(null, { id: diet.id, title: diet.title, description: diet.description, userId: diet.user.id });
    } catch (err) {
      callback(err);
    }
  },
  DeleteDiet: async (call, callback) => {
    try {
      const diet = await Diet.findByIdAndDelete(call.request.id);
      if (!diet) {
        return callback(new Error('Diet not found'));
      }
      callback(null, { id: diet.id, title: diet.title, description: diet.description, userId: diet.user.id });
    } catch (err) {
      callback(err);
    }
  },
});

server.bindAsync('localhost:50054', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Diet gRPC service running at localhost:50054');
  server.start();
});
