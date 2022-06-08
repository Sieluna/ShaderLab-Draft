const { DataTypes } = require("sequelize");

module.exports = sequelize => {
    return sequelize.define("session", {
        sid: {
            type: DataTypes.STRING(36),
            field: "session_sid",
            primaryKey: true
        },
        data: {
            type: DataTypes.TEXT,
            field: "session_data"
        },
        expires: {
            type: DataTypes.DATE,
            field: "session_expires"
        }
    }, {
        createdAt: "session_create",
        updatedAt: "session_update"
    });
}
