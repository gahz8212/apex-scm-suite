const Sequelize = require("sequelize");
module.exports = class Good extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        groupName: {
          type: Sequelize.STRING(50),
          unique: true,
        },
        itemName: {
          type: Sequelize.STRING(50),
          unique: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        hooks: {
          afterBulkCreate: async (goods) => {
            goods.forEach((good) => {
              sequelize.models.Item.upsert({
                itemName: good.itemName,
                GoodId: good.id,
              });
              sequelize.models.GoodBackup.create({
                itemName: good.itemName,
                groupName: good.groupName,
                GoodId: good.id,
              });
            });
          },
          afterCreate: async (good) => {
            sequelize.models.Item.upsert({
              itemName: good.itemName,
              GoodId: good.id,
            });
            sequelize.models.GoodBackup.create({
              itemName: good.itemName,
              groupName: good.groupName,
              GoodId: good.id,
            });
          },
          afterUpdate: async (good) => {
            sequelize.models.GoodBackup.create({
              itemName: good.itemName,
              groupName: good.groupName,
              GoodId: good.id,
            });
          },
        },
        timestamps: true,
        underscored: false,
        paranoid: false,
        modelName: "Good",
        freezeTableName: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Good.hasMany(db.Item);
  }
};
