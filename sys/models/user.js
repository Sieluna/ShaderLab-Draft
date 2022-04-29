const { DataTypes } = require("sequelize");
const crypto = require("crypto");

module.exports = sequelize => {
    return sequelize.define("user", {
        id: {
            type: DataTypes.INTEGER,
            field: "user_id",
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(16),
            field: "user_name",
            unique: true
        },
        avatar: {
            type: DataTypes.BLOB,
            field: "user_avatar"
        },
        email: {
            type: DataTypes.STRING(64),
            field: "user_email",
            unique: true
        },
        password: {
            type: DataTypes.STRING(32),
            field: "user_password",
            allowNull: false,
            set(value) {
                const enPsw = crypto.createHash("md5").update(this.name + value).digest("hex");
                this.setDataValue("password", enPsw);
            }
        },
        introduction: {
            type: DataTypes.STRING,
            field: "user_introduction"
        },
        permission: {
            type: DataTypes.INTEGER,
            field: "user_rank",
            defaultValue: 1
        }
    }, {
        paranoid: true,
        createdAt: "user_create",
        updatedAt: "user_update",
        deleteAt: "user_abort"
    });
}
