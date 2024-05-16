const { ApolloError } = require('apollo-server-express');
const User = require('../user/user');
const Workout = require('../workout/workout');
const Exercise = require('../exercise/exercise');
const Diet = require('../diet/diet');
const sendMessage = require('../kafka/kafkaProducer');

const resolvers = {
  Query: {
    users: async () => {
      try {
        return await User.find();
      } catch (error) {
        throw new ApolloError(`Error finding users: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    user: async (_, { id }) => {
      try {
        return await User.findById(id);
      } catch (error) {
        throw new ApolloError(`Error finding user: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    workouts: async () => {
      try {
        return await Workout.find().populate('userId');
      } catch (error) {
        throw new ApolloError(`Error finding workouts: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    workout: async (_, { id }) => {
      try {
        return await Workout.findById(id).populate('userId');
      } catch (error) {
        throw new ApolloError(`Error finding workout: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    exercises: async () => {
      try {
        return await Exercise.find().populate('workoutId');
      } catch (error) {
        throw new ApolloError(`Error finding exercises: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    exercise: async (_, { id }) => {
      try {
        return await Exercise.findById(id).populate('workoutId');
      } catch (error) {
        throw new ApolloError(`Error finding exercise: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    diets: async () => {
      try {
        return await Diet.find().populate('userId');
      } catch (error) {
        throw new ApolloError(`Error finding diets: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    diet: async (_, { id }) => {
      try {
        return await Diet.findById(id).populate('userId');
      } catch (error) {
        throw new ApolloError(`Error finding diet: ${error.message}`, "INTERNAL_ERROR");
      }
    },
  },
  Mutation: {
    createUser: async (_, { name, email, age }) => {
      try {
        const newUser = new User({ name, email, age });
        const user = await newUser.save();
        await sendMessage('fitness-events', `User created: ${user.name}`);
        return user;
      } catch (error) {
        throw new ApolloError(`Error creating user: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    updateUser: async (_, { id, name, email, age }) => {
      try {
        const user = await User.findByIdAndUpdate(id, { name, email, age }, { new: true });
        if (!user) {
          throw new ApolloError("User not found", "NOT_FOUND");
        }
        await sendMessage('fitness-events', `User updated: ${user.name}`);
        return user;
      } catch (error) {
        throw new ApolloError(`Error updating user: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteUser: async (_, { id }) => {
      try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
          throw new ApolloError("User not found", "NOT_FOUND");
        }
        await sendMessage('fitness-events', `User deleted: ${user.name}`);
        return "User deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting user: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    createWorkout: async (_, { title, description, userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new ApolloError("User not found", "NOT_FOUND");
        }
        const newWorkout = new Workout({ title, description, userId });
        const workout = await newWorkout.save();
        await sendMessage('fitness-events', `Workout created: ${workout.title}`);
        return workout;
      } catch (error) {
        throw new ApolloError(`Error creating workout: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    updateWorkout: async (_, { id, title, description, userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new ApolloError("User not found", "NOT_FOUND");
        }
        const workout = await Workout.findByIdAndUpdate(id, { title, description, userId }, { new: true });
        if (!workout) {
          throw new ApolloError("Workout not found", "NOT_FOUND");
        }
        await sendMessage('fitness-events', `Workout updated: ${workout.title}`);
        return workout;
      } catch (error) {
        throw new ApolloError(`Error updating workout: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteWorkout: async (_, { id }) => {
      try {
        const workout = await Workout.findByIdAndDelete(id);
        if (!workout) {
          throw new ApolloError("Workout not found", "NOT_FOUND");
        }
        await sendMessage('fitness-events', `Workout deleted: ${workout.title}`);
        return "Workout deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting workout: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    createExercise: async (_, { name, description, workoutId }) => {
      try {
        const workout = await Workout.findById(workoutId);
        if (!workout) {
          throw new ApolloError("Workout not found", "NOT_FOUND");
        }
        const newExercise = new Exercise({ name, description, workoutId });
        const exercise = await newExercise.save();
        await sendMessage('fitness-events', `Exercise created: ${exercise.name}`);
        return exercise;
      } catch (error) {
        throw new ApolloError(`Error creating exercise: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    updateExercise: async (_, { id, name, description, workoutId }) => {
      try {
        const workout = await Workout.findById(workoutId);
        if (!workout) {
          throw new ApolloError("Workout not found", "NOT_FOUND");
        }
        const exercise = await Exercise.findByIdAndUpdate(id, { name, description, workoutId }, { new: true });
        if (!exercise) {
          throw new ApolloError("Exercise not found", "NOT_FOUND");
        }
        await sendMessage('fitness-events', `Exercise updated: ${exercise.name}`);
        return exercise;
      } catch (error) {
        throw new ApolloError(`Error updating exercise: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteExercise: async (_, { id }) => {
      try {
        const exercise = await Exercise.findByIdAndDelete(id);
        if (!exercise) {
          throw new ApolloError("Exercise not found", "NOT_FOUND");
        }
        await sendMessage('fitness-events', `Exercise deleted: ${exercise.name}`);
        return "Exercise deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting exercise: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    createDiet: async (_, { title, description, userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new ApolloError("User not found", "NOT_FOUND");
        }
        const newDiet = new Diet({ title, description, userId });
        const diet = await newDiet.save();
        await sendMessage('fitness-events', `Diet created: ${diet.title}`);
        return diet;
      } catch (error) {
        throw new ApolloError(`Error creating diet: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    updateDiet: async (_, { id, title, description, userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          throw new ApolloError("User not found", "NOT_FOUND");
        }
        const diet = await Diet.findByIdAndUpdate(id, { title, description, userId }, { new: true });
        if (!diet) {
          throw new ApolloError("Diet not found", "NOT_FOUND");
        }
        await sendMessage('fitness-events', `Diet updated: ${diet.title}`);
        return diet;
      } catch (error) {
        throw new ApolloError(`Error updating diet: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteDiet: async (_, { id }) => {
      try {
        const diet = await Diet.findByIdAndDelete(id);
        if (!diet) {
          throw new ApolloError("Diet not found", "NOT_FOUND");
        }
        await sendMessage('fitness-events', `Diet deleted: ${diet.title}`);
        return "Diet deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting diet: ${error.message}`, "INTERNAL_ERROR");
      }
    },
  },
  Workout: {
    user: async (workout) => {
      return await User.findById(workout.userId);
    },
  },
  Exercise: {
    workout: async (exercise) => {
      return await Workout.findById(exercise.workoutId);
    },
  },
  Diet: {
    user: async (diet) => {
      return await User.findById(diet.userId);
    },
  },
};

module.exports = resolvers;
