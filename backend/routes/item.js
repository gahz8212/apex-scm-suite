const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { Item, Image, Good, Relation, Picker, User, StockHistory, sequelize } = require("../models");
const { Op } = require("sequelize");
const { isLoggedIn, requireRole } = require("../middlewares/auth");

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      file.originalname = Buffer.from(file.originalname, "latin1").toString(
        "utf8"
      );
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      cb(null, `${Date.now()}_${basename}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
router.post("/images", isLoggedIn, upload.array("images"), async (req, res) => {
  try {
    const files = req.files.map((file) => ({ url: `/img/${file.filename}` }));
    return res.status(200).json(files);
  } catch (e) {
    return res.status(400).json(e.message);
  }
});
router.post("/item", requireRole("ADMIN", "MANAGER"), async (req, res) => {
  const {
    type,
    groupType,
    descript,
    category,
    unit,
    im_price,
    ex_price,
    weight,
    cbm,
    moq,
    sets,
    use,
    supplyer,
    groupName,
    itemName,
    imageList,
    dragItems,
  } = req.body;
  // console.log("dragItems", dragItems);

  try {
    const [newItem, relations] = await sequelize.transaction(async (t) => {
      if (type === "SET") {
        const [good] = await Good.findOrCreate({
          where: {
            groupName,
            itemName,
          },
          transaction: t,
        });

        await Item.upsert(
          {
            type,
            groupType,
            descript,
            category,
            unit,
            im_price,
            ex_price,
            weight,
            cbm,
            sets,
            moq,
            use,
            supplyer,
            itemName,
            groupName,
            GoodId: good.id,
          },
          { transaction: t }
        );
      } else if (type === "ASSY") {
        await Item.create(
          {
            category,
            type,
            groupType: null,
            itemName,
            descript,
            unit,
            im_price,
            ex_price,
            use,
            weight,
            cbm,
            moq,
            supplyer,
          },
          { transaction: t }
        );
      } else {
        await Item.create(
          {
            category,
            type,
            itemName,
            groupType: null,
            descript,
            unit,
            im_price,
            ex_price,
            use,
            weight,
            cbm,
            moq,
            supplyer,
          },
          { transaction: t }
        );
      }

      const item = await Item.findOne({
        where: { itemName },
        attributes: ["id"],
        transaction: t,
      });

      if (imageList && imageList.length > 0) {
        await Image.bulkCreate(
          imageList.map((image) => ({ url: image.url, ItemId: item.id })),
          { transaction: t }
        );
      }

      let createdRelations = [];
      if (dragItems && dragItems.length > 0) {
        const relData = dragItems.map((dragItem) => ({
          LowerId: dragItem.id,
          UpperId: item.id,
          point: dragItem.point,
        }));
        await Relation.destroy({ where: { UpperId: item.id }, transaction: t });
        createdRelations = await Relation.bulkCreate(relData, { transaction: t });
      }

      const foundItem = await Item.findOne({
        where: { id: item.id },
        include: [
          { model: Image, attributes: ["url"] },
          { model: Good, attributes: ["groupName"] },
        ],
        transaction: t,
      });

      return [foundItem, createdRelations];
    });

    return res.status(200).json([newItem, relations]);
  } catch (e) {
    console.error(e);
    return res.status(400).json(e.message);
  }
});
router.get("/items", isLoggedIn, async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { use: true },
      attributes: [
        "id",
        "type",
        "groupType",
        "itemName",
        "descript",
        "category",
        "unit",
        "im_price",
        "sum_im_price",
        "ex_price",
        "weight",
        "cbm",
        "moq",
        "sets",
        "number1",
        "number2",
        "use",
        "supplyer",
        "stock",
        "safety_stock",
        "lead_time",
        "suppliers",
        "rfq_status",
        "selected_supplier",
      ],
      include: [
        { model: Image, attributes: ["url"] },
        { model: Good, attributes: ["groupName"] },
      ],
      order: [["id", "asc"]],
    });
    const relations = await Relation.findAll();
    return res.status(200).json([items, relations]);
  } catch (e) {
    console.error(e);
    return res.status(400).json(e.message);
  }
});

router.patch("/edit", requireRole("ADMIN", "MANAGER"), async (req, res) => {
  let { id, Images, dragItems, mode, ...rest } = req.body;

  const relations = dragItems.map((dragItem) => ({
    LowerId: dragItem.id,
    UpperId: dragItem.targetId,
    point: dragItem.point,
  }));
  // console.log("dragItems", dragItems);
  // console.log("relations", relations, id);
  try {
    id = parseInt(id, 10);
    console.log(id, rest);

    await sequelize.transaction(async (t) => {
      const currentItem = await Item.findByPk(id, { lock: t.LOCK.UPDATE, transaction: t });
      if (currentItem && rest.stock !== undefined && Number(rest.stock) !== Number(currentItem.stock)) {
        const prevStock = Number(currentItem.stock) || 0;
        const nextStock = Number(rest.stock) || 0;
        await StockHistory.create(
          {
            ItemId: id,
            UserId: req.user ? req.user.id : null,
            change_type: "ADJUSTMENT",
            qty_change: nextStock - prevStock,
            prev_stock: prevStock,
            next_stock: nextStock,
            reason: `관리자 수동 재고 조정 (${prevStock} ➔ ${nextStock} EA)`,
          },
          { transaction: t }
        );
      }
      await Item.update(rest, { where: { id }, individualHooks: true, transaction: t });

      if (Images && Images.length > 0) {
        await Image.destroy({ where: { ItemId: id }, transaction: t });
        await Image.bulkCreate(
          Images.map((image) => ({ url: image.url, ItemId: id })),
          { transaction: t }
        );
      }
      if (relations && relations.length > 0) {
        await Relation.destroy({ where: { UpperId: id }, transaction: t });
        await Relation.bulkCreate(relations, { transaction: t });
      }
    });

    if (mode === "rest") {
      return res.status(200).json("edit_ok");
    } else {
      return res.status(200).json("good_ok");
    }
  } catch (e) {
    console.error(e);
    return res.status(400).json(e.message);
  }
});
router.delete("/delete/:id", requireRole("ADMIN"), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await Item.destroy({ where: { id }, individualHooks: true });
    return res.status(200).json("remove_ok");
  } catch (e) {
    console.error(e);
    return res.status(400).json(e.message);
  }
});

router.post("/excelAdd", requireRole("ADMIN", "MANAGER"), async (req, res) => {
  const datas = req.body;
  try {
    if (datas) {
      const results = await Item.bulkCreate(datas);
      const resultIds = results.map((result) => result.id);

      const finddatas = await Item.findAll({
        where: { id: resultIds },
        include: { model: Image },
      });

      return res.status(200).json(finddatas);
    }
  } catch (e) {
    return res.status(400).json(e.message);
  }
});
router.post("/inputPicked", isLoggedIn, async (req, res) => {
  const picked = req.body;
  console.log("picked", picked);
  try {
    await Picker.destroy({ where: {} });
    if (Array.isArray(picked) && picked.length > 0) {
      const records = picked.map((pick) => ({
        check: pick.check,
        itemName: pick.itemName,
        unit: pick.unit,
        im_price: pick.im_price,
        ex_price: pick.ex_price,
        quantity: pick.quantity,
        weight: pick.check ? pick.weight : null,
        cbm: pick.check ? pick.cbm : null,
        CT_qty: pick.check ? pick.CT_qty : null,
        ItemId: pick.ItemId,
      }));
      await Picker.bulkCreate(records);
    }
    return res.status(200).json("inputPicked_ok");
  } catch (e) {
    return res.status(400).json(e.message);
  }
});
router.get("/getPicked", isLoggedIn, async (req, res) => {
  try {
    const pickedDatas = await Picker.findAll({});
    if (pickedDatas) {
      // console.log(pickedDatas);

      return res.status(200).json(pickedDatas);
    }
  } catch (e) {
    return res.status(400).json(e.message);
  }
});

router.patch("/updateRfqStatus", requireRole("ADMIN", "MANAGER"), async (req, res) => {
  const { id, rfq_status, selected_supplier, po_qty } = req.body;
  try {
    const updateData = {};
    if (rfq_status !== undefined) updateData.rfq_status = rfq_status;
    if (selected_supplier !== undefined) updateData.selected_supplier = selected_supplier;
    if (po_qty !== undefined) updateData.po_qty = parseInt(po_qty, 10) || 0;

    await Item.update(updateData, { where: { id: parseInt(id, 10) } });
    return res.status(200).json({ success: true, id, rfq_status, selected_supplier, po_qty });
  } catch (e) {
    console.error(e);
    return res.status(400).json(e.message);
  }
});

router.patch("/inbound", requireRole("ADMIN", "MANAGER"), async (req, res) => {
  const { id, inbound_qty, warehouse, is_completed, remain_qty } = req.body;
  try {
    const itemId = parseInt(id, 10);
    const qty = parseInt(inbound_qty, 10) || 0;
    const completed = is_completed !== false; // 기본값 true (완료)
    const nextStatus = completed ? "IDLE" : "PO_SENT";
    const nextPoQty = completed ? 0 : Math.max(0, parseInt(remain_qty, 10) || 0);

    const result = await sequelize.transaction(async (t) => {
      const item = await Item.findByPk(itemId, {
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!item) {
        const err = new Error("Item not found");
        err.statusCode = 404;
        throw err;
      }

      const prevStock = Number(item.stock) || 0;
      const newStock = prevStock + qty;

      await item.update(
        { stock: newStock, rfq_status: nextStatus, po_qty: nextPoQty },
        { transaction: t }
      );

      await StockHistory.create(
        {
          ItemId: itemId,
          UserId: req.user ? req.user.id : null,
          change_type: "INBOUND",
          qty_change: qty,
          prev_stock: prevStock,
          next_stock: newStock,
          reason: `자재 입고 등록 (${warehouse || '기본 창고'}, +${qty} EA)`,
        },
        { transaction: t }
      );

      return { prevStock, newStock };
    });

    return res.status(200).json({
      success: true,
      id: itemId,
      prevStock: result.prevStock,
      stock: result.newStock,
      rfq_status: nextStatus,
      po_qty: nextPoQty,
      warehouse: warehouse || "제1 중앙물류창고",
      inbound_qty: qty,
    });
  } catch (e) {
    console.error(e);
    return res.status(e.statusCode || 400).json({
      success: false,
      message: e.message,
    });
  }
});

/**
 * 특정 품목의 재고 수불부(변경 이력) 조회
 * GET /item/:id/history
 */
router.get("/:id/history", async (req, res) => {
  try {
    const itemId = parseInt(req.params.id, 10);
    const histories = await StockHistory.findAll({
      where: { ItemId: itemId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 100,
    });
    return res.status(200).json({ success: true, data: histories });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;

