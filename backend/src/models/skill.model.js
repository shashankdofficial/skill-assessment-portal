const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Skill', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'skills',
    underscored: true
  });
};
