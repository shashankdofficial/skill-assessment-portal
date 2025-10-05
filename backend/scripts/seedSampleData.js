// backend/scripts/seedSampleData.js
// Robust seed script that detects model attribute names (password field etc.)
// and seeds admin user + sample skills + one sample question.

const path = require('path');
const bcrypt = require('bcryptjs');

function tryRequireCandidates() {
  const candidates = [
    path.join(__dirname, '..', 'src', 'models'),
    path.join(__dirname, '..', 'models'),
    path.join(__dirname, '..', 'src', 'db', 'models'),
  ];
  for (const p of candidates) {
    try {
      // eslint-disable-next-line
      const m = require(p);
      console.log('Loaded models from:', p);
      return m;
    } catch (err) {
      // ignore
    }
  }
  return null;
}

function detectPasswordField(UserModel) {
  // check rawAttributes for likely candidates
  const attrs = UserModel.rawAttributes ? Object.keys(UserModel.rawAttributes) : Object.keys(UserModel.prototype || {});
  const candidates = ['password_hash', 'passwordHash', 'password', 'passwd', 'pwd'];
  for (const c of candidates) {
    if (attrs.includes(c)) return c;
  }
  // fallback: first attribute that includes 'pass'
  for (const a of attrs) {
    if (a.toLowerCase().includes('pass')) return a;
  }
  // if not found, return null and we'll attempt to create with 'password' anyway
  return null;
}

async function run() {
  try {
    const models = tryRequireCandidates();
    if (!models) {
      console.error('ERROR: Could not find your models. Tried common locations: ../src/models, ../models, ../src/db/models');
      console.error('Please check where your Sequelize models are exported and adjust the path in scripts/seedSampleData.js');
      process.exit(1);
    }

    // Normalize exports (two common styles)
    const User = models.User || (models.models && models.models.User);
    const Skill = models.Skill || (models.models && models.models.Skill);
    const Question = models.Question || (models.models && models.models.Question);

    if (!User || !Skill || !Question) {
      console.error('ERROR: Found models file but required models (User, Skill, Question) are missing.');
      console.error('Available keys from models export:', Object.keys(models));
      process.exit(1);
    }

    // show model attributes for diagnostics
    console.log('User raw attributes:', Object.keys(User.rawAttributes || {}));
    console.log('Skill raw attributes:', Object.keys(Skill.rawAttributes || {}));
    console.log('Question raw attributes:', Object.keys(Question.rawAttributes || {}));

    const adminEmail = process.env.INIT_ADMIN_EMAIL || 'admin@example.com';
    const adminPass = process.env.INIT_ADMIN_PASS || 'superpass';

    // determine which field to set for password
    const passwordField = detectPasswordField(User);
    console.log('Detected password field for User model:', passwordField || '(none detected; will try "password")');

    // find or create admin. We'll build createPayload dynamically to match model names.
    let admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const hash = await bcrypt.hash(adminPass, 10);
      const createPayload = { name: 'Seed Admin', email: adminEmail, role: 'admin' };

      if (passwordField) {
        // try common naming styles
        if (passwordField === 'password_hash' || passwordField === 'passwordHash') createPayload[passwordField] = hash;
        else if (passwordField === 'password') createPayload[passwordField] = adminPass; // some models hash in hooks
        else createPayload[passwordField] = adminPass;
      } else {
        // fallback assumption: model expects 'password' or handles hashing in hooks
        createPayload.password = adminPass;
      }

      // create and catch validation errors for diagnosis
      try {
        admin = await User.create(createPayload);
        console.log(`Created admin user: ${adminEmail} / ${adminPass}`);
      } catch (createErr) {
        console.error('Failed to create admin user. Validation/DB error follows:\n', createErr);
        // show helpful info then exit
        if (createErr.errors) {
          createErr.errors.forEach(e => console.error(' Validation error:', e.message, 'path=', e.path, 'value=', e.value));
        }
        process.exit(1);
      }
    } else {
      console.log('Admin already exists:', adminEmail);
    }

    // Create sample skills
    const skillsToCreate = [
      { name: 'React Fundamentals', description: 'Hooks, components, state & props' },
      { name: 'Node & Express', description: 'Express routing, middleware' },
      { name: 'MySQL Basics', description: 'SQL queries and schema design' },
    ];

    for (const s of skillsToCreate) {
      const [skill, created] = await Skill.findOrCreate({ where: { name: s.name }, defaults: s });
      if (created) console.log('Created skill:', skill.name);
      else console.log('Skill exists:', skill.name);
    }

    // Add a sample question for first skill if none exist
    const firstSkill = await Skill.findOne({ where: { name: skillsToCreate[0].name } });
    if (firstSkill) {
      const count = await Question.count({ where: { skillId: firstSkill.id } });
      if (count === 0) {
        // detect whether Question.options expects JSON array or text:
        const qAttrs = Question.rawAttributes || {};
        const optionsAttr = qAttrs.options || {};
        const expectsString = optionsAttr.type && optionsAttr.type.key && (optionsAttr.type.key === 'TEXT' || optionsAttr.type.key === 'STRING');

        const optionsArr = [
          { id: 'A', text: 'A function that lets you use state.' },
          { id: 'B', text: 'A special component.' },
          { id: 'C', text: 'A server setting.'}
        ];

        const toCreate = {
          skillId: firstSkill.id,
          text: 'What is a React Hook?',
          correct_option: 'A',
          weight: 1
        };

        toCreate.options = expectsString ? JSON.stringify(optionsArr) : optionsArr;

        await Question.create(toCreate);
        console.log(`Created sample question for skill: ${firstSkill.name}`);
      } else {
        console.log('Questions already exist for skill:', firstSkill.name);
      }
    } else {
      console.warn('Could not find the target skill to add a question.');
    }

    console.log('Seed finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed with error:', err);
    process.exit(1);
  }
}

run();
