const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Question', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    skillId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'skill_id' },
    text: { type: DataTypes.TEXT, allowNull: false },
    options: { type: DataTypes.JSON, allowNull: false },
    correct_option: { type: DataTypes.STRING(255), allowNull: false },
    weight: { type: DataTypes.INTEGER, defaultValue: 1 }
  }, {
    tableName: 'questions',
    underscored: true
  });
};
