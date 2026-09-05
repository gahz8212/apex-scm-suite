const Sequelize = require("sequelize");
module.exports = class ItemBackup extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        type: {
          type: Sequelize.ENUM,
          values: ["SET", "ASSY", "PARTS"],
        },
        groupType: { type: Sequelize.STRING(10) },
        itemName: { type: Sequelize.STRING(50)},
        descript: { type: Sequelize.STRING(200), allowNull: true },
        category: {
          type: Sequelize.ENUM,
          values: [
            "EDT",
            "NOBARK",
            "RDT",
            "LAUNCHER",
            "회로",
            "기구",
            "전장",
            "포장",
            "기타",
          ],
        },
        unit: {
          type: Sequelize.STRING(3),
          defaultValue: "\\",
        },
        im_price: { type: Sequelize.FLOAT(9, 2), allowNull: true },
        ex_price: { type: Sequelize.FLOAT(9, 3), allowNull: true },
        weight: { type: Sequelize.FLOAT(5, 2), defaultValue: 0 },
        cbm: { type: Sequelize.FLOAT(4, 3), defaultValue: 0 },
        moq: { type: Sequelize.INTEGER, defaultValue: 0 },
        sets: { type: Sequelize.STRING(3), defaultValue: "SET" },
        number1: { type: Sequelize.INTEGER, allowNull: true },
        number2: { type: Sequelize.INTEGER, allowNull: true },
        use: { type: Sequelize.BOOLEAN, defaultValue: true },
        delete: { type: Sequelize.BOOLEAN, defaultValue: true },
        supplyer: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: "",
        },
        ItemId: {
          type: Sequelize.INTEGER,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        paranoid: false,
        modelName: "ItemBackup",
        freezeTableName: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
};
