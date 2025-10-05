const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('QuizAnswer', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    attemptId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'attempt_id' },
    questionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'question_id' },
    selected_option: { type: DataTypes.STRING(255), allowNull: true },
    is_correct: { type: DataTypes.BOOLEAN, defaultValue: false },
    points_earned: { type: DataTypes.FLOAT, defaultValue: 0 }
  }, {
    tableName: 'quiz_answers',
    underscored: true
  });
};
