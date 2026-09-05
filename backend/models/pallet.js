const Sequelize = require("sequelize");
module.exports = class Pallet extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        no: { type: Sequelize.INTEGER, allowNull: true },
        item: { type: Sequelize.STRING(50), allowNull: true },
        CT_qty: { type: Sequelize.INTEGER, allowNull: true },
        moq: { type: Sequelize.INTEGER, allowNull: true },
        sets: { type: Sequelize.STRING(3), allowNull: true },
        weight: { type: Sequelize.FLOAT(4, 1), allowNull: true },
        cbm: { type: Sequelize.FLOAT(4, 3), allowNull: true },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        paranoid: false,
        modelName: "Pallet",
        tableName: "pallet",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
};
