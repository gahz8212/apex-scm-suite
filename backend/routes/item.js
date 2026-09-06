const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { Item, Image, Good, Relation, Picker } = require("../models");
const { Op } = require("sequelize");

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
router.post("/images", upload.array("images"), async (req, res) => {
  try {
    const files = req.files.map((file) => ({ url: `/img/${file.filename}` }));
    return res.status(200).json(files);
  } catch (e) {
    return res.status(400).json(e.message);
  }
});
router.post("/item", async (req, res) => {
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
    //set가 들어오면 Item에
    //assy나 item이 들어오면 item에 입력
    //image는 image의 goodId에 입력
    if (type === "SET") {
      const [good, create] = await Good.findOrCreate({
        where: {
          groupName,
          itemName,
        },
      });

      await Item.upsert({
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
        where: { itemName: good.itemName },
      });
    } else if (type === "ASSY") {
      await Item.create({
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
      });
    } else {
      await Item.create({
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
      });
    }
    const item = await Item.findOne({
      where: { itemName },
      attributes: ["id"],
    });
    // console.log("item", item);
    const image_promise = await Promise.all(
      imageList.map((image) =>
        Image.create({ url: image.url, ItemId: item.id })
      )
    );
    item.addImage(image_promise.map((image) => image[0]));

    const newItem = await Item.findOne({
      where: { id: item.id }, //배열일 경우엔 where:{id:{[Op.in]:itemIds}} 또는 where:{id:itemIds}

      include: [
        { model: Image, attributes: ["url"] },
        { model: Good, attributes: ["groupName"] },
      ],
    });
    // console.log("newItem", newItem);
    if (dragItems && dragItems.length > 0) {
      const relations = dragItems.map((dragItem) => ({
        LowerId: dragItem.id,
        UpperId: item.id,
        point: dragItem.point,
      }));
      await Relation.destroy({ where: { UpperId: item.id } });
      await Relation.bulkCreate(relations);
      return res.status(200).json([newItem, relations]);
    }

    return res.status(200).json([newItem, []]);
  } catch (e) {
    console.error(e);
    return res.status(400).json(e.message);
  }
});
router.get("/items", async (req, res) => {
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

router.patch("/edit", async (req, res) => {
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
    await Item.update(rest, { where: { id }, individualHooks: true });

    if (Images && Images.length > 0) {
      await Image.destroy({ where: { ItemId: id } });
      await Image.bulkCreate(
        Images.map((image) => ({ url: image.url, ItemId: id }))
      );
    }
    if (relations && relations.length > 0) {
      await Relation.destroy({ where: { UpperId: id } });
      await Relation.bulkCreate(relations);
    }
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
router.delete("/delete/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await Item.destroy({ where: { id }, individualHooks: true });
    return res.status(200).json("remove_ok");
  } catch (e) {
    console.error(e);
    return res.status(400).json(e.message);
  }
});

router.post("/excelAdd", async (req, res) => {
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
router.post("/inputPicked", async (req, res) => {
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
router.get("/getPicked", async (req, res) => {
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

router.patch("/updateRfqStatus", async (req, res) => {
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

router.patch("/inbound", async (req, res) => {
  const { id, inbound_qty, warehouse, is_completed, remain_qty } = req.body;
  try {
    const itemId = parseInt(id, 10);
    const item = await Item.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    const qty = parseInt(inbound_qty, 10) || 0;
    const prevStock = item.stock || 0;
    const newStock = prevStock + qty;

    const completed = is_completed !== false; // 기본값 true (완료)
    const nextStatus = completed ? "IDLE" : "PO_SENT";
    const nextPoQty = completed ? 0 : Math.max(0, parseInt(remain_qty, 10) || 0);

    await Item.update(
      { stock: newStock, rfq_status: nextStatus, po_qty: nextPoQty },
      { where: { id: itemId } }
    );
    return res.status(200).json({
      success: true,
      id: itemId,
      prevStock,
      stock: newStock,
      rfq_status: nextStatus,
      po_qty: nextPoQty,
      warehouse: warehouse || "제1 중앙물류창고",
      inbound_qty: qty,
    });
  } catch (e) {
    console.error(e);
    return res.status(400).json(e.message);
  }
});

module.exports = router;

