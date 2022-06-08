const debug = require("debug")("shaderlab:query");
const { Sequelize } = require("sequelize");
const { keywordsMap, regexMap, extractKeywords } = require("../debug/keywords.js");
const config = require("../config/sql.js");
const { colors } = require("../debug/style.js");

const normalizeSql = sql => {
    if (process.env.NODE_ENV != "production") {
        sql = sql.slice(sql.indexOf(":") + 2);
        const presentKeywords = extractKeywords(sql);
        sql = sql.replaceAll(";", colors.yellow(";"));
        sql = sql.replace(/(['`].*?['`])/g, colors.green("$1"));
        sql = sql.replace(/(\w*?)\(/g, colors.red("$1") + "(");
        sql = sql.replace(/([()])/g, colors.yellow("$1"));
        presentKeywords.forEach(keyword => sql = sql.replace(regexMap[keyword], colors.magenta(keywordsMap[keyword] ?? keyword)));
        debug(sql);
    }
};

const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: debug.enabled ? sql => normalizeSql(sql) : false,
    pool: {
        max: config.pool.max,
        min: config.pool.min,
        acquire: config.pool.acquire,
        idle: config.pool.idle
    }
});

const session = require("../models/session.js")(sequelize);

const usersTable = require("../models/user.js")(sequelize);
const topicsTable = require("../models/topic.js")(sequelize);
const tagsTable = require("../models/tag.js")(sequelize);
const postsTable = require("../models/post.js")(sequelize);
const thumbsTable = require("../models/thumb.js")(sequelize);
const commentsTable = require("../models/comment.js")(sequelize);
const repliesTable = require("../models/reply.js")(sequelize);

usersTable.hasMany(postsTable, { foreignKey: { allowNull: false, field: "post_user" }});
postsTable.belongsTo(usersTable);
topicsTable.hasMany(postsTable, { foreignKey: { allowNull: false, field: "post_topic" }});
postsTable.belongsTo(topicsTable);

usersTable.hasMany(thumbsTable, { foreignKey: { allowNull: false, field: "thumb_user" }});
thumbsTable.belongsTo(usersTable);
postsTable.hasMany(thumbsTable, { foreignKey: { allowNull: false, field: "thumb_post" }});
thumbsTable.belongsTo(postsTable);

usersTable.hasMany(commentsTable, { foreignKey: { allowNull: false, field: "comment_user" }});
commentsTable.belongsTo(usersTable);
postsTable.hasMany(commentsTable, { foreignKey: { allowNull: false, field: "comment_post" }});
commentsTable.belongsTo(postsTable);

commentsTable.hasMany(repliesTable, { foreignKey: { allowNull: false, field: "reply_comment" }});
repliesTable.belongsTo(commentsTable);
usersTable.hasMany(repliesTable, { foreignKey: { allowNull: false, field: "reply_user" }});
repliesTable.belongsTo(usersTable);

postsTable.hasMany(tagsTable, { foreignKey: { allowNull: false, field: "tag_post" }});
tagsTable.belongsTo(postsTable);

module.exports = sequelize;
