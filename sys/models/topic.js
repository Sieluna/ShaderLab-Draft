const { DataTypes } = require("sequelize");

module.exports = sequelize => {
    return sequelize.define("topic", {
        id: {
            type: DataTypes.INTEGER,
            field: "topic_id",
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(32),
            field: "topic_name",
            allowNull: false,
            unique: true
        },
        image: {
            type: DataTypes.BLOB,
            field: "topic_image"
        },
        description: {
            type: DataTypes.STRING,
            field: "topic_description"
        }
    }, {
        createdAt: "topic_create",
        updatedAt: "topic_update"
    });
}