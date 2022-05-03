const { DataTypes } = require("sequelize");

module.exports = sequelize => {
    return sequelize.define("post", {
        id: {
            type: DataTypes.INTEGER,
            field: "post_id",
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(32),
            field: "post_name",
            allowNull: false
        },
        preview: {
            type: DataTypes.STRING,
            field: "post_preview"
        },
        content: {
            type: DataTypes.TEXT,
            field: "post_content",
            allowNull: false
        },
        views: {
            type: DataTypes.INTEGER,
            field: "post_views",
            defaultValue: 0
        }
    }, {
        paranoid: true,
        createdAt: "post_create",
        updatedAt: "post_update",
        deleteAt: "post_abort"
    });
}
