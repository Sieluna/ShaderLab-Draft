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
            type: DataTypes.STRING,
            field: "user_avatar"
        },
        email: {
            type: DataTypes.STRING,
            field: "user_email",
            unique: true
        },
        password: {
            type: DataTypes.STRING(32),
            field: "user_password",
            allowNull: false
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
        hooks: {
            beforeCreate: (instance, options) => {
                instance.setDataValue("password", crypto.createHash("md5").
                update(instance.name + instance.password).digest("hex"));
            },
            beforeBulkCreate(instances, options) {
                for (const instance of instances) {
                    instance.setDataValue("password", crypto.createHash("md5").
                    update(instance.name + instance.password).digest("hex"));
                }
            },
            beforeUpdate: (instance, options) => {
                if (instance.changed("name") || instance.changed("password")) {
                    instance.setDataValue("password", crypto.createHash("md5").
                    update(instance.name + instance.password).digest("hex"));
                }
            },
        },
        paranoid: true,
        createdAt: "user_create",
        updatedAt: "user_update",
        deleteAt: "user_abort"
    });
}
