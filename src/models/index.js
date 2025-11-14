const sequelize = require('../config/database');
const User = require('./User');
const App = require('./App');
const Event = require('./Event');

// Define associations
User.hasMany(App, { foreignKey: 'userId', as: 'apps' });
App.belongsTo(User, { foreignKey: 'userId', as: 'user' });

App.hasMany(Event, { foreignKey: 'appId', as: 'events' });
Event.belongsTo(App, { foreignKey: 'appId', as: 'app' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Use { force: true } to drop tables
    console.log('✅ Database synced successfully');
  } catch (error) {
    console.error('❌ Error syncing database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  App,
  Event,
  syncDatabase
};