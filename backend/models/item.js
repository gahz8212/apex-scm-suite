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
        stock: { type: Sequelize.INTEGER, defaultValue: 0 },
        safety_stock: { type: Sequelize.INTEGER, defaultValue: 0 },
        lead_time: { type: Sequelize.STRING(20), defaultValue: "2주" },
        suppliers: { type: Sequelize.TEXT, defaultValue: "[]" },
        rfq_status: { type: Sequelize.STRING(20), defaultValue: "IDLE" },
        selected_supplier: { type: Sequelize.STRING(50), defaultValue: "" },
        po_qty: { type: Sequelize.INTEGER, defaultValue: 0 },
      },
      {
        sequelize,
        hooks: {
          afterUpdate: async (item, options) => {
            const tx = options ? options.transaction : undefined;
            // 품목 마스터 속성(이름, 단가, 공급처 등)이 변경되었을 때만 백업 및 피커 동기화 실행
            if (
              item.changed("itemName") ||
              item.changed("im_price") ||
              item.changed("ex_price") ||
              item.changed("unit") ||
              item.changed("supplyer") ||
              item.changed("category") ||
              item.changed("groupType")
            ) {
              await sequelize.models.ItemBackup.create(
                {
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
                },
                { transaction: tx }
              );
              await sequelize.models.Picker.update(
                {
                  item: item.itemName,
                  unit: item.unit,
                  im_price: item.im_price,
                  ex_price: item.ex_price,
                  supplyer: item.supplyer,
                },
                { where: { ItemId: item.id }, transaction: tx }
              );
            }
          },
          afterDestroy: async (item, options) => {
            const tx = options ? options.transaction : undefined;
            await sequelize.models.ItemBackup.create(
              {
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
              },
              { transaction: tx }
            );
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
    db.Item.hasMany(db.StockHistory, { foreignKey: "ItemId", sourceKey: "id" });
  }
};
