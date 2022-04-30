const { DataTypes } = require("sequelize");

module.exports = sequelize => {
    return sequelize.define("reply", {
        id: {
            type: DataTypes.INTEGER,
            field: "reply_id",
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        content: {
            type: DataTypes.TEXT,
            field: "reply_content",
            allowNull: false
        },
        target: {
            type: DataTypes.INTEGER,
            field: "reply_target",
            allowNull: false
        }
    }, {
        createdAt: "reply_create",
        updatedAt: "reply_update"
    });
}
