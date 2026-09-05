const Sequelize = require("sequelize");
module.exports = class Relation extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        point: { type: Sequelize.INTEGER },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Relation",
        freezeTableName: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
};
