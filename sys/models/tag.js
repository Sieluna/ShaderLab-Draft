const { DataTypes } = require("sequelize");

module.exports = sequelize => {
    return sequelize.define("tag", {
        id: {
            type: DataTypes.INTEGER,
            field: "tag_id",
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(32),
            field: "tag_name",
            allowNull: false
        }
    }, {
        createdAt: "tag_create",
        updatedAt: "tag_update"
    });
}