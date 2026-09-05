const express = require("express");
const router = express.Router();
const { Good, Item, Order, Pallet } = require("../models");
const { sequelize } = require("../models");
router.get("/getOrderData", async (req, res) => {
  try {
    const [order, metadata] = await sequelize.query(
      `
    select * from ordersheet order by number1,number2;
    `
    );

    return res.status(200).json(order);
  } catch (e) {
    return res.status(400).json(e.message);
  }
});
// router.get("/getDummyItem", async (req, res) => {
//   try {
//     await sequelize.query(
//       `
//       drop table if exists dummies;
//     `
//     );
//     await sequelize.query(
//       `
//       CREATE TABLE if not exists dummies
//       (SELECT itemName,NAME ,NUMBER1,NUMBER2 FROM good  WHERE goods.use=TRUE AND NUMBER1 IS NOT NULL AND
//         CATEGORY IN ('RDT','EDT','NOBARK')
//         ORDER BY good.NUMBER1,goods.NUMBER2);
//     `
//     );
//     await sequelize.query(
//       `
//       alter table if exists dummies
//       add count integer;
//     `
//     );
//     await sequelize.query(
//       `
//       alter table if exists dummies
//       add primary key(itemName);
//     `
//     );
//     const [results] = await sequelize.query(
//       `select * from dummies ORDER BY NUMBER1,NUMBER2`
//     );
//     // console.log(results);
//     return res.status(200).json(results);
//   } catch (e) {
//     return res.status(400).json(e.message);
//   }
// });
router.post("/orderinput", async (req, res) => {
  try {
    const { order } = req.body;
    if (!order || !Array.isArray(order) || !order[0] || !order[1]) {
      return res.status(400).json("잘못된 발주서 데이터입니다.");
    }

    const safeColumns = order[1].map((col) =>
      String(col).replace(/[^a-zA-Z0-9_]/g, "")
    );

    await Order.destroy({ where: {} });
    await Order.bulkCreate(order[0]);

    const selectCols = safeColumns.map((col) => `O.\`${col}\``).join(", ");

    const [results] = await sequelize.query(
      `
      SELECT 
      G.itemName,
      ${selectCols},
      L.descript,
      L.category,
      L.unit,
      L.im_price,
      L.ex_price,
      L.weight,
      L.cbm,
      L.moq,
      L.sets,
      L.number1,
      L.number2,
      L.use,
      date_format(L.input_date,'%Y-%m-%d')
      FROM good G inner join item L on G.id=L.id right join orders O on G.groupName=O.Item
      WHERE L.use=1 
      ORDER BY L.number1,L.number2
      `
    );

    await sequelize.query(`drop table if exists ordersheet`);

    await sequelize.query(`
      create table ordersheet (
        SELECT 
        G.itemName,
        ${selectCols},
        L.descript,
        L.category,
        L.unit,
        L.im_price,
        L.ex_price,
        L.weight,
        L.cbm,
        L.moq,
        L.sets,
        L.number1,
        L.number2,
        L.use,
        date_format(L.input_date,'%Y-%m-%d') 
        FROM good G inner join item L on G.id=L.id right join orders O on G.groupName=O.Item
        WHERE L.use=1 
        ORDER BY L.number1,L.number2
      )
    `);

    return res.status(200).json(results);
  } catch (e) {
    console.error(e);
    return res.status(400).json(e.message);
  }
});

router.post("/goodinput", async (req, res) => {
  try {
    const { good } = req.body;

    if (Object.keys(good[0]).includes("undefined")) {
      throw new Error("오더리스트를 선택함.");
    }
    if (Object.keys(good[0]).includes("groupName")) {
      await sequelize.query(`delete from good;`);
      if (Array.isArray(good)) {
        await Good.bulkCreate(good);
      }
    } else if (Object.keys(good[0]).includes("itemName")) {
      if (Array.isArray(good)) {
        await Promise.all(
          good.map(async (item) => {
            await Item.upsert({
              type: item.type,
              itemName: item.itemName,
              groupType: item.groupType,
              descript: item.descript,
              category: item.category,
              unit: item.unit,
              im_price: item.im_price,
              ex_price: item.ex_price,
              weight: item.weight,
              cbm: item.cbm,
              moq: item.moq,
              sets: item.sets,
              number1: item.number1,
              number2: item.number2,
              use: item.use,
              input_date: item.input_date,
            });
          })
        );
      }
    }
    return res.status(200).json("good_input_ok");
  } catch (e) {
    console.error(e);
    return res.status(400).json(e.message);
  }
});

router.post("/palletData", async (req, res) => {
  try {
    const palletData = req.body;
    await Pallet.destroy({ where: {} });
    const records = [];
    for (let i = 0; i < 10; i++) {
      if (Array.isArray(palletData[i])) {
        palletData[i].forEach((pallet) => {
          records.push({
            no: i,
            item: pallet.item,
            CT_qty: pallet.CT_qty,
            moq: pallet.moq,
            sets: pallet.sets,
            weight: pallet.weight,
            cbm: pallet.cbm,
          });
        });
      }
    }
    if (records.length > 0) {
      await Pallet.bulkCreate(records);
    }
    return res.status(200).json("pallet_input_ok");
  } catch (e) {
    console.error(e);
    return res.status(400).json(e.message);
  }
});

router.get("/getPalletData", async (req, res) => {
  try {
    const data = await Pallet.findAll({
      attributes: ["no", "item", "CT_qty", "moq", "sets", "weight", "cbm"],
    });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(400).json(e.message);
  }
});

router.post("/inputRepair", async (req, res) => {
  const repair = req.body;
  try {
    await sequelize.query(`delete from ordersheet where category='REPAIR'`);

    await Promise.all(
      repair.map(async (rep) => {
        const descript = rep.descript !== undefined ? rep.descript : " ";
        const cbm = rep.cbm !== undefined ? Number(rep.cbm) : 0;
        const im_price = rep.im_price !== undefined ? Number(rep.im_price) : 0;
        const ex_price = rep.ex_price !== undefined ? Number(rep.ex_price) : 0;
        const weight = rep.weight !== undefined ? Number(rep.weight) : 0;
        const moq = rep.check && rep.CT_qty ? Number(rep.quantity) / Number(rep.CT_qty) : 0;
        const safeMonth = String(rep.month).replace(/[^a-zA-Z0-9_]/g, "");

        return sequelize.query(
          `insert into ordersheet (itemName, category, \`${safeMonth}\`, descript, unit, im_price, ex_price, weight, cbm, number1, number2, sets, moq)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          {
            replacements: [
              rep.itemName,
              rep.category,
              rep.quantity,
              descript,
              rep.unit,
              im_price,
              ex_price,
              weight,
              cbm,
              rep.number1,
              rep.id,
              rep.sets,
              moq,
            ],
          }
        );
      })
    );
    return res.status(200).json("inputRepair_ok");
  } catch (e) {
    console.error(e);
    return res.status(400).json(e.message);
  }
});
module.exports = router;
