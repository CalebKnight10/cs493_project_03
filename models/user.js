const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')

const User = sequelize.define('user', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
})

exports.User = User
exports.UserClientFields = [
  'userId',
  'name',
  'email',
  'password',
  'admin',
  'businessId'
]