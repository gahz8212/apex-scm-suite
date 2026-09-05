const Sequelize = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config.json")[env];
const db = {};
const User = require("./user");
const Item = require("./item");
const Image = require("./image");
const Good = require("./good");
const Order = require("./orders");
const GoodBackup = require("./good-backup");
const ItemBackup = require("./item-backup");
const Relation = require("./relation");
const Pallet = require("./pallet");
const Picker = require("./picker");
const Shipment = require("./shipment");

const dbDatabase = process.env.DB_DATABASE || config.database;
const dbUsername = process.env.DB_USERNAME || config.username;
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : config.password;
const dbHost = process.env.DB_HOST || config.host;

const sequelize = new Sequelize(
  dbDatabase,
  dbUsername,
  dbPassword,
  {
    ...config,
    host: dbHost,
  }
);

db.sequelize = sequelize;
db.User = User;
db.Item = Item;
db.Image = Image;
db.Good = Good;
db.Order = Order;
db.GoodBackup = GoodBackup;
db.ItemBackup = ItemBackup;
db.Relation = Relation;
db.Pallet = Pallet;
db.Picker = Picker;
db.Shipment = Shipment;
// db.OrderSheet = OrderSheet;
User.init(sequelize);
Item.init(sequelize);
Image.init(sequelize);
Good.init(sequelize);
GoodBackup.init(sequelize);
ItemBackup.init(sequelize);
Order.init(sequelize);
Relation.init(sequelize);
Pallet.init(sequelize);
Picker.init(sequelize);
Shipment.init(sequelize);

Image.associate(db);
Good.associate(db);
GoodBackup.associate(db);
Item.associate(db);
Picker.associate(db);
module.exports = db;
