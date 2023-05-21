const { DataTypes } = require('sequelize')

const sequelize = require('../lib/sequelize')

const bcrypt = require('bcryptjs');

const jwt = require("jsonwebtoken")


const User = sequelize.define('user', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false, async set(value) { const pwHash = await bcrypt.hash(User.password, 8); this.setDataValue('password', pwHash(value)); } },
  admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
});

User.prototype.genToken = function () {
    return jwt.sign({
      id: this.id,
      name: this.name,
      email: this.email,
      admin: this.admin,
    }, process.env.JWT_SECRET, { expiresIn: '1d' })
  }

exports.User = User
exports.UserClientFields = [
  'userId',
  'name',
  'email',
  'password',
  'admin',
  'businessId'
]