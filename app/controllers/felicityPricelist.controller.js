const db = require("../models");
const Account = db.accounts;
const Logging = require("./logging.controller.js");
const FelicityPriceEffectivity = db.felicitypriceeffectivity;
const FelicityPriceEffectivityLogging = db.felicitypriceeffectivityloggings;
const FelicityPriceList = db.felicitypricelists;
const FelicityProduct = db.felicityproducts;
const Supplier = db.suppliers;
const Sequelize = db.Sequelize;
const excelJS = require("exceljs");
require("dotenv").config();

exports.createAllProducts = async (pricerange_id, creator_id) => {
  const products = await FelicityProduct.findAll({ where: { active: true } });

  for (let prod of products) {
    var pricelist = {
      price_effectivity_id: pricerange_id,
      product_id: prod.id,
      createdBy: creator_id,
    };
    await FelicityPriceList.create(pricelist);
  }
};

exports.getPriceList = async (req, res) => {
  const id = req.params.id;
  FelicityPriceList.findAll({
    include: [
      {
        model: FelicityProduct,
        attributes: ["item_code", "item_name", "item_category", "item_type"],
      },
      {
        model: Supplier,
        attributes: ["registered_name"],
      },
    ],
    where: {
      price_effectivity_id: id,
    },
    order: [
      [
        Sequelize.literal(`
        CASE 
             WHEN felicityproduct.item_category = 'Meat' AND felicityproduct.item_type = 'Beef' THEN 1
             WHEN felicityproduct.item_category = 'Meat' AND felicityproduct.item_type = 'Chicken'  THEN 2
             WHEN felicityproduct.item_category = 'Meat' AND felicityproduct.item_type = 'Pork'  THEN 3
             WHEN felicityproduct.item_category = 'Meat' AND felicityproduct.item_type = 'Seafood'  THEN 4
             WHEN felicityproduct.item_category = 'Produce' AND felicityproduct.item_type = 'Fruits'  THEN 5
             WHEN felicityproduct.item_category = 'Produce' AND felicityproduct.item_type = 'Vegetable'  THEN 6             
             ELSE 7
        END
      `),
      ],
    ],
  })
    .then(async (data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occured while retrieving price list items",
      });
    });
};

// Update an Price list item by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;
  if (!id) {
    res.status(404).send({ message: "Missing Price List ID" });
    return;
  }
  if (!updateData) {
    res.status(404).send({ message: "Missing Price List Item Data" });
    return;
  }

  FelicityPriceList.update(updateData, {
    where: { id: id },
  })
    .then(async (num) => {
      if (num == 1) {
        res.send({
          message: "Price list was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update Product with id=${id}. Maybe Product was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Product with id=" + id,
      });
    });
};

exports.exportExcel = async (req, res) => {
  const id = req.params.id;
  const workbook = new excelJS.Workbook();
  const priceeffectivity = await FelicityPriceEffectivity.findByPk(id, {
    attributes: [
      [
        Sequelize.fn(
          "to_char",
          Sequelize.col("start_effectivity_date"),
          "Mon dd, yyyy"
        ),
        "start_effectivity_date",
      ],
      [
        Sequelize.fn(
          "to_char",
          Sequelize.col("end_effectivity_date"),
          "Mon dd, yyyy"
        ),
        "end_effectivity_date",
      ],
    ],
  });

  if (!priceeffectivity) {
    res.status(404).send({ message: "Price effectivity ID not found" });
    return;
  }

  const priceListItems = await FelicityPriceList.findAll({
    include: [
      {
        model: FelicityProduct,
        attributes: ["item_code", "item_name", "item_category", "item_type"],
      },
      {
        model: Supplier,
        attributes: ["registered_name"],
      },
    ],
    where: {
      price_effectivity_id: id,
    },
    order: [
      [
        Sequelize.literal(`
          CASE 
               WHEN felicityproduct.item_category = 'Meat' AND felicityproduct.item_type = 'Beef' THEN 1
               WHEN felicityproduct.item_category = 'Meat' AND felicityproduct.item_type = 'Chicken'  THEN 2
               WHEN felicityproduct.item_category = 'Meat' AND felicityproduct.item_type = 'Pork'  THEN 3
               WHEN felicityproduct.item_category = 'Meat' AND felicityproduct.item_type = 'Seafood'  THEN 4
               WHEN felicityproduct.item_category = 'Produce' AND felicityproduct.item_type = 'Fruits'  THEN 5
               WHEN felicityproduct.item_category = 'Produce' AND felicityproduct.item_type = 'Vegetable'  THEN 6             
               ELSE 7
          END
        `),
      ],
    ],
  });
  const pricelist = priceeffectivity.dataValues;
  const worksheet = workbook.addWorksheet(
    `${pricelist.start_effectivity_date} To ${pricelist.end_effectivity_date}`
  );

  worksheet.columns = [
    { header: "Product Code", key: "item_code", width: 20 },
    { header: "Product Name", key: "item_name", width: 30 },
    { header: "Purchasing Price", key: "purchasing_price", width: 20 },
    { header: "Supplier Code", key: "supplier_code", width: 20 },
    { header: "Supplier Name", key: "supplier.registered_name", width: 30 },
    {
      header: "Standard Price Markup Percentage",
      key: "standard_price_percent",
      width: 30,
    },
    { header: "Standard Price", key: "standard_price", width: 20 },
    {
      header: "Premium Price Discount Percentage",
      key: "premium_price_percent",
      width: 30,
    },
    { header: "Premium Price", key: "premium_price", width: 20 },
    { header: "Competitor 1", key: "competitor_one", width: 30 },
    { header: "Competitor 1 Price", key: "competitor_one_price", width: 20 },
    { header: "Competitor 2", key: "competitor_two", width: 30 },
    { header: "Competitor 2 Price", key: "competitor_two_price", width: 20 },
    { header: "Competitor 3", key: "competitor_three", width: 30 },
    { header: "Competitor 3 Price", key: "competitor_three_price", width: 20 },
  ];
  var index = 2;
  var rowLength = 15;
  const row = worksheet.getRow(1);
  row.outlineLevel = 1;

  //Adding borders and alignments to each cell in row 1 Headers
  for (let i = 1; i <= rowLength; i++) {
    row.getCell(i).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    row.getCell(i).alignment = { vertical: "middle", horizontal: "center" };
  }
  row.getCell(1).value = "Product Code";
  row.getCell(2).value = "Product Name";
  priceListItems.forEach((item) => {
    worksheet.addRow(item);
    // add a column of new values

    const row = worksheet.getRow(index);
    row.outlineLevel = 1;
     //Adding borders and alignments to each cell in row 1 Headers
    for (let i = 1; i <= rowLength; i++) {
      row.getCell(i).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      row.getCell(i).alignment = { vertical: "middle", horizontal: "center" };
    }
    row.getCell(1).value = item.felicityproduct.item_code;
    row.getCell(2).value = item.felicityproduct.item_name;

    if (item.standard_price_percent) {
      row.getCell(6).value = parseFloat(item.standard_price_percent) / 100;
      row.getCell(6).numFmt = "0.00%";
    }
    if (item.premium_price_percent) {
      row.getCell(8).value = parseFloat(item.premium_price_percent) / 100;
      row.getCell(8).numFmt = "0.00%";
    }

    if (item.purchasing_price) {
      row.getCell(3).value = parseFloat(item.purchasing_price);
      row.getCell(3).numFmt = "₱#,##0.00;[Red]-₱#,##0.00";
    }

    if (item.standard_price) {
      row.getCell(7).value = parseFloat(item.standard_price);
      row.getCell(7).numFmt = "₱#,##0.00;[Red]-₱#,##0.00";
    }

    if (item.premium_price) {
      row.getCell(9).value = parseFloat(item.premium_price);
      row.getCell(9).numFmt = "₱#,##0.00;[Red]-₱#,##0.00";
    }

    if (item.competitor_one_price) {
      row.getCell(11).value = parseFloat(item.competitor_one_price);
      row.getCell(11).numFmt = "₱#,##0.00;[Red]-₱#,##0.00";
    }
    if (item.competitor_two_price) {
      row.getCell(13).value = parseFloat(item.competitor_two_price);
      row.getCell(13).numFmt = "₱#,##0.00;[Red]-₱#,##0.00";
    }

    if (item.competitor_three_price) {
      row.getCell(15).value = parseFloat(item.competitor_three_price);
      row.getCell(15).numFmt = "₱#,##0.00;[Red]-₱#,##0.00";
    }

    if (item.supplier) {
      row.getCell(5).value = item.supplier.registered_name;
    }

    index++;
  });

  // Making first line in excel bold
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  const filename = `${pricelist.start_effectivity_date
    .replaceAll(",", "")
    .replaceAll(" ", "_")}_TO_${pricelist.end_effectivity_date
    .replaceAll(",", "")
    .replaceAll(" ", "_")}`;
  // Set the Content-Type and Content-Disposition headers.
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(`Content-Disposition`, `attachment; filename=${filename}.xlsx`);

  return workbook.xlsx.write(res).then(function () {
    res.status(200).end();
  });
};
