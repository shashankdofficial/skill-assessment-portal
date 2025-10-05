const sequelize = require('../config/db');

const User = require('./user.model')(sequelize);
const Skill = require('./skill.model')(sequelize);
const Question = require('./question.model')(sequelize);
const QuizAttempt = require('./quizAttempt.model')(sequelize);
const QuizAnswer = require('./quizAnswer.model')(sequelize);

User.hasMany(QuizAttempt, { foreignKey: 'userId' });
QuizAttempt.belongsTo(User, { foreignKey: 'userId' });

Skill.hasMany(Question, { foreignKey: 'skillId' });
Question.belongsTo(Skill, { foreignKey: 'skillId' });

Skill.hasMany(QuizAttempt, { foreignKey: 'skillId' });
QuizAttempt.belongsTo(Skill, { foreignKey: 'skillId' });

QuizAttempt.hasMany(QuizAnswer, { foreignKey: 'attemptId' });
QuizAnswer.belongsTo(QuizAttempt, { foreignKey: 'attemptId' });

Question.hasMany(QuizAnswer, { foreignKey: 'questionId' });
QuizAnswer.belongsTo(Question, { foreignKey: 'questionId' });

module.exports = {
  sequelize,
  User,
  Skill,
  Question,
  QuizAttempt,
  QuizAnswer
};
