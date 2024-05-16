const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./database');
const resolvers = require('./graphql/resolvers');
const typeDefs = require('./graphql/schema');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const sendMessage = require('./kafka/kafkaProducer');

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

// Load Protos
const userProtoPath = __dirname + '/user/user.proto';
const workoutProtoPath = __dirname + '/workout/workout.proto';
const exerciseProtoPath = __dirname + '/exercise/exercise.proto';
const dietProtoPath = __dirname + '/diet/diet.proto';

const userPackageDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const workoutPackageDefinition = protoLoader.loadSync(workoutProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const exercisePackageDefinition = protoLoader.loadSync(exerciseProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const dietPackageDefinition = protoLoader.loadSync(dietProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(userPackageDefinition).user;
const workoutProto = grpc.loadPackageDefinition(workoutPackageDefinition).workout;
const exerciseProto = grpc.loadPackageDefinition(exercisePackageDefinition).exercise;
const dietProto = grpc.loadPackageDefinition(dietPackageDefinition).diet;

const userClient = new userProto.UserService('localhost:50051', grpc.credentials.createInsecure());
const workoutClient = new workoutProto.WorkoutService('localhost:50052', grpc.credentials.createInsecure());
const exerciseClient = new exerciseProto.ExerciseService('localhost:50053', grpc.credentials.createInsecure());
const dietClient = new dietProto.DietService('localhost:50054', grpc.credentials.createInsecure());

// REST Endpoints for User
app.post('/user', (req, res) => {
  userClient.CreateUser(req.body, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('fitness-events', `User created: ${response.name}`);
      res.send(response);
    }
  });
});

app.get('/user/:id', (req, res) => {
  userClient.GetUser({ id: req.params.id }, (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.send(response);
    }
  });
});

app.put('/user/:id', (req, res) => {
  const updatedUser = { ...req.body, id: req.params.id };
  userClient.UpdateUser(updatedUser, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('fitness-events', `User updated: ${response.name}`);
      res.send(response);
    }
  });
});

app.delete('/user/:id', (req, res) => {
  userClient.DeleteUser({ id: req.params.id }, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('fitness-events', `User deleted: ${response.name}`);
      res.send(response);
    }
  });
});

// REST Endpoints for Workout
app.post('/workout', (req, res) => {
  workoutClient.CreateWorkout(req.body, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('fitness-events', `Workout created: ${response.title}`);
      res.send(response);
    }
  });
});

app.get('/workout/:id', (req, res) => {
  workoutClient.GetWorkout({ id: req.params.id }, (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.send(response);
    }
  });
});

app.put('/workout/:id', (req, res) => {
  const updatedWorkout = { ...req.body, id: req.params.id };
  workoutClient.UpdateWorkout(updatedWorkout, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('fitness-events', `Workout updated: ${response.title}`);
      res.send(response);
    }
  });
});

app.delete('/workout/:id', (req, res) => {
  workoutClient.DeleteWorkout({ id: req.params.id }, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('fitness-events', `Workout deleted: ${response.title}`);
      res.send(response);
    }
  });
});

// REST Endpoints for Exercise
app.post('/exercise', (req, res) => {
  exerciseClient.CreateExercise(req.body, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('fitness-events', `Exercise created: ${response.name}`);
      res.send(response);
    }
  });
});

app.get('/exercise/:id', (req, res) => {
  exerciseClient.GetExercise({ id: req.params.id }, (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.send(response);
    }
  });
});

app.put('/exercise/:id', (req, res) => {
  const updatedExercise = { ...req.body, id: req.params.id };
  exerciseClient.UpdateExercise(updatedExercise, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('fitness-events', `Exercise updated: ${response.name}`);
      res.send(response);
    }
  });
});

app.delete('/exercise/:id', (req, res) => {
  exerciseClient.DeleteExercise({ id: req.params.id }, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('fitness-events', `Exercise deleted: ${response.name}`);
      res.send(response);
    }
  });
});

// REST Endpoints for Diet
app.post('/diet', (req, res) => {
  dietClient.CreateDiet(req.body, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('fitness-events', `Diet created: ${response.title}`);
      res.send(response);
    }
  });
});

app.get('/diet/:id', (req, res) => {
  dietClient.GetDiet({ id: req.params.id }, (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.send(response);
    }
  });
});

app.put('/diet/:id', (req, res) => {
  const updatedDiet = { ...req.body, id: req.params.id };
  dietClient.UpdateDiet(updatedDiet, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('fitness-events', `Diet updated: ${response.title}`);
      res.send(response);
    }
  });
});

app.delete('/diet/:id', (req, res) => {
  dietClient.DeleteDiet({ id: req.params.id }, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('fitness-events', `Diet deleted: ${response.title}`);
      res.send(response);
    }
  });
});

// GraphQL Endpoint
async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app });

  const port = 3000;
  app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
    console.log(`GraphQL endpoint available at http://localhost:${port}${server.graphqlPath}`);
  });
}

startServer();
