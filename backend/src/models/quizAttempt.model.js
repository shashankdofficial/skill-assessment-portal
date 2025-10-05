const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('QuizAttempt', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
    skillId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'skill_id' },
    score: { type: DataTypes.FLOAT, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false },
    started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    duration_seconds: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'quiz_attempts',
    underscored: true
  });
};
