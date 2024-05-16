const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const User = require('./user');

const PROTO_PATH = __dirname + '/user.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

mongoose.connect('mongodb://localhost:27017/fitness', { useNewUrlParser: true, useUnifiedTopology: true });

const server = new grpc.Server();

server.addService(userProto.UserService.service, {
  GetUser: async (call, callback) => {
    try {
      const user = await User.findById(call.request.id);
      if (!user) {
        return callback(new Error('User not found'));
      }
      callback(null, { user });
    } catch (err) {
      callback(err);
    }
  },
  CreateUser: async (call, callback) => {
    try {
      const newUser = new User(call.request);
      const user = await newUser.save();
      callback(null, { user });
    } catch (err) {
      callback(err);
    }
  },
  UpdateUser: async (call, callback) => {
    try {
      const user = await User.findByIdAndUpdate(call.request.id, call.request, { new: true });
      if (!user) {
        return callback(new Error('User not found'));
      }
      callback(null, { user });
    } catch (err) {
      callback(err);
    }
  },
  DeleteUser: async (call, callback) => {
    try {
      const user = await User.findByIdAndDelete(call.request.id);
      if (!user) {
        return callback(new Error('User not found'));
      }
      callback(null, { user });
    } catch (err) {
      callback(err);
    }
  },
});

server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('User gRPC service running at localhost:50051');
  server.start();
});
