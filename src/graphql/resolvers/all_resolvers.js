const bcrypt = require("bcrypt");
const { User } = require("../../models/user");
const { Employee } = require("../../models/employee");

const hashPassword = require("../../utils/hashPassword");
const generateToken = require("../../utils/generateToken");

// GraphQL Resolvers
const resolvers = {
  Query: {
    hello: () => "This is a test query",
    users: async (_) => {
      const users = await User.find();
      return users;
    },
    user: async (_, { id }) => {
      if (!context.user) {
        throw new Error("You must be logged in to use this action");
      }
      const user = await User.findById(id);
      return user;
    },

    employees: async (parent, args, context) => {
      if (!context.user) {
        throw new Error("You must be logged in to use this action");
      }
      const Employees = await Employee.find();
      return Employees;
    },
    employee: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("You must be logged in to use this action");
      }

      const Employee = await Employee.findById(id);
      return Employee;
    },
  },
  Mutation: {
    createUser: async (_, { username, email, password }) => {
      const hashedPassword = await hashPassword(password);
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });
      await user.save();
      const token = generateToken(user);
      return { ...user, id: user._id, token };
    },

    createEmployee: async (_, { first_name, last_name, email }, context) => {
      if (!context.user) {
        throw new Error("You must be logged in to use this action");
      }
      const employee = new Employee({
        first_name,
        last_name,
        email,
      });
      await employee.save();
      return { ...employee._doc, id: employee._id };
    },

    updateEmployee: async (parent, args, context) => {
      if (!context.user) {
        throw new Error("You must be logged in to use this action");
      }

      const { id } = args;
      const updatedEmployee = await Employee.findByIdAndUpdate(id, args);
      if (!updatedEmployee) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      return updatedEmployee;
    },

    deleteEmployee: async (parent, args, context) => {
      if (!context.user) {
        throw new Error("You must be logged in to use this action");
      }
      const { id } = args;
      const deletedEmployee = await Student.findByIdAndDelete(id);
      if (!deletedEmployee) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      return deletedEmployee;
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new Error("Invalid email or password");
      }

      const token = generateToken({ userId: user.id });
      return {
        token,
        user,
      };
    },
  },
};

module.exports = { resolvers };
