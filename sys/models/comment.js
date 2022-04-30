const { DataTypes } = require("sequelize");

module.exports = sequelize => {
    return sequelize.define("comment", {
        id: {
            type: DataTypes.INTEGER,
            field: "comment_id",
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        content: {
            type: DataTypes.TEXT,
            field: "comment_content",
            allowNull: false
        },
        rank: {
            type: DataTypes.INTEGER,
            field: "comment_rank",
            allowNull: false,
            defaultValue: 0
        }
    }, {
        createdAt: "comment_create",
        updatedAt: "comment_update"
    });
}