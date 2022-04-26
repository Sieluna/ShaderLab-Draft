const { DataTypes } = require("sequelize");

module.exports = sequelize => {
    return sequelize.define("thumb", {
        id: {
            type: DataTypes.INTEGER,
            field: "thumb_id",
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        }
    }, {
        createdAt: "thumb_create",
        updatedAt: "thumb_update"
    });
}