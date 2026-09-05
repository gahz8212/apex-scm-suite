const Sequelize = require("sequelize");
module.exports = class GoodBackup extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        groupName: {
          type: Sequelize.STRING(50),
        },
        itemName: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        paranoid: false,
        modelName: "GoodBackup",
        freezeTableName: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.GoodBackup.belongsTo(db.Good);
  }
};
