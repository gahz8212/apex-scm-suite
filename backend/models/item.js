const Sequelize = require("sequelize");
module.exports = class Item extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        type: {
          type: Sequelize.ENUM,
          values: ["SET", "ASSY", "PARTS"],
        },
        groupType: { type: Sequelize.STRING(10) },
        itemName: { type: Sequelize.STRING(50), unique: true },
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
        sum_im_price: { type: Sequelize.FLOAT(9, 2), allowNull: true },
        ex_price: { type: Sequelize.FLOAT(9, 3), allowNull: true },
        weight: { type: Sequelize.FLOAT(5, 2), defaultValue: 0 },
        cbm: { type: Sequelize.FLOAT(4, 3), defaultValue: 0 },
        moq: { type: Sequelize.INTEGER, defaultValue: 0 },
        sets: { type: Sequelize.STRING(3), defaultValue: "SET" },
        number1: { type: Sequelize.INTEGER, allowNull: true },
        number2: { type: Sequelize.INTEGER, allowNull: true },
        use: { type: Sequelize.BOOLEAN, defaultValue: true },
        input_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        supplyer: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: "",
        },
      },
      {
        sequelize,
        hooks: {
          afterUpdate: async (item) => {
            await sequelize.models.ItemBackup.create({
              type: item.type,
              groupType: item.groupType,
              itemName: item.itemName,
              category: item.category,
              unit: item.unit,
              im_price: item.previous().im_price,
              ex_price: item.previous().ex_price,
              weight: item.weight,
              cbm: item.cbm,
              moq: item.moq,
              sets: item.sets,
              use: item.use,
              delete: 0,
              supplyer: item.supplyer,
              createdAt: item.createdAt,
              updateAt: Date.now(),
              ItemId: item.id,
            });
            await sequelize.models.Picker.update(
              {
                item: item.itemName,
                unit: item.unit,
                im_price: item.im_price,
                ex_price: item.ex_price,
                supplyer: item.supplyer,
              },
              { where: { ItemId: item.id } }
            );
          },
          afterDestroy: async (item) => {
            await sequelize.models.ItemBackup.create({
              type: item.type,
              groupType: item.groupType,
              itemName: item.itemName,
              category: item.category,
              unit: item.unit,
              im_price: item.im_price,
              ex_price: item.ex_price,
              weight: item.weight,
              cbm: item.cbm,
              moq: item.moq,
              sets: item.sets,
              use: item.use,
              delete: 1,
              supplyer: item.supplyer,
              createdAt: item.createdAt,
              deletedAt: Date.now(),
              ItemId: item.id,
            });
          },
        },
        timestamps: true,
        underscored: false,
        paranoid: false,
        modelName: "Item",
        freezeTableName: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Item.hasMany(db.Image);
    db.Item.belongsTo(db.Good);
    db.Item.hasMany(db.Picker);
    db.Item.belongsToMany(db.Item, {
      through: "Relation",
      as: "Upper",
      foreignKey: "LowerId",
    });
    db.Item.belongsToMany(db.Item, {
      through: "Relation",
      as: "Lower",
      foreignKey: "UpperId",
    });
  }
};
