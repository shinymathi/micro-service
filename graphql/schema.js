const { gql } = require('apollo-server-express');

const typeDefs = gql`
type User {
    id: ID!
    name: String!
    email: String!
    age: Int!
  }
  
  type Workout {
    id: ID!
    title: String!
    description: String
    userId: ID!
    user: User
  }
  
  type Exercise {
    id: ID!
    name: String!
    description: String
    workoutId: ID!
    workout: Workout
  }
  
  type Diet {
    id: ID!
    title: String!
    description: String
    userId: ID!
    user: User
  }
  
  type Query {
    users: [User]
    user(id: ID!): User
    workouts: [Workout]
    workout(id: ID!): Workout
    exercises: [Exercise]
    exercise(id: ID!): Exercise
    diets: [Diet]
    diet(id: ID!): Diet
  }
  
  type Mutation {
    createUser(name: String!, email: String!, age: Int!): User
    updateUser(id: ID!, name: String, email: String, age: Int): User
    deleteUser(id: ID!): String
  
    createWorkout(title: String!, description: String, userId: ID!): Workout
    updateWorkout(id: ID!, title: String, description: String, userId: ID!): Workout
    deleteWorkout(id: ID!): String
  
    createExercise(name: String!, description: String, workoutId: ID!): Exercise
    updateExercise(id: ID!, name: String, description: String, workoutId: ID!): Exercise
    deleteExercise(id: ID!): String
  
    createDiet(title: String!, description: String, userId: ID!): Diet
    updateDiet(id: ID!, title: String, description: String, userId: ID!): Diet
    deleteDiet(id: ID!): String
  }
`;
module.exports = typeDefs;