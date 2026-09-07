const Sequelize = require("sequelize");

module.exports = class StockHistory extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        ItemId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        UserId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        export_no: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        change_type: {
          type: Sequelize.ENUM("DISPATCH", "DISPATCH_CANCEL", "INBOUND", "ADJUSTMENT"),
          allowNull: false,
        },
        qty_change: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        prev_stock: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        next_stock: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        reason: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        paranoid: false,
        modelName: "StockHistory",
        tableName: "stock_histories",
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.StockHistory.belongsTo(db.Item, { foreignKey: "ItemId", targetKey: "id" });
    db.StockHistory.belongsTo(db.User, { foreignKey: "UserId", targetKey: "id" });
  }
};
