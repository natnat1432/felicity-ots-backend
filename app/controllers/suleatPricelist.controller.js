const db = require("../models");
const Account = db.accounts;
const Logging = require("./logging.controller.js");
const SuleatPriceList = db.suleatpricelists;
const SuleatProduct = db.suleatproducts;
const Sequelize = db.Sequelize;
const excelJS = require("exceljs");
const date = require('date-and-time');
require("dotenv").config();

exports.create = async (req, res) => {
  const item = req.body;

  if (!item) {
    res.status(404).send({ message: "Request body not found" });
    return;
  }

  //Save the list to database
  const product = await SuleatProduct.findByPk(req.body.product_id);
  if (!product) {
    res.status(404).send({ message: "Suleat product not found" });
    return;
  }

  SuleatPriceList.create(req.body)
    .then(async (data) => {
      const description = `Added Suleat Product ${product.item_name} with an item code of ${product.item_code} to price list with a price of ₱${req.body.item_price}`;
      const createLogging = await Logging.createLoggingData(
        item.creator_id,
        description
      );

      res.status(200).send({
        message: "Product added in price list",
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while adding the product to price list.",
      });
    });
};

exports.update = async (req, res) => {
  const item = req.body;

  if (!item) {
    res.status(404).send({ message: "Request body not found" });
    return;
  }

  //Save the list to database
  const product = await SuleatProduct.findByPk(req.body.product_id);
  if (!product) {
    res.status(404).send({ message: "Suleat product not found" });
    return;
  }

  const existingPrice = await SuleatPriceList.findOne({
    where: { product_id: item.product_id },
    order: [["createdAt", "DESC"]],
  });

  SuleatPriceList.create(req.body)
    .then(async (data) => {
      const description = `Updated Suleat Product ${product.item_name} with an item code of ${product.item_code} Price from ₱${existingPrice.item_price} to ₱${req.body.item_price}`;
      const createLogging = await Logging.createLoggingData(
        item.creator_id,
        description
      );

      res.status(200).send({
        message: "Product updated in the price list",
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while adding the product to price list.",
      });
    });
};

exports.findAll = async (req, res) => {
  try {
    const latestPrices = await SuleatPriceList.findAll({
      attributes: [
        "product_id",
        [Sequelize.fn("max", Sequelize.col("createdAt")), "latestCreatedAt"],
      ],

      group: ["product_id"],
      raw: true,
    });

    const result = await Promise.all(
      latestPrices.map(async (price) => {
        const latestItemPrice = await SuleatPriceList.findOne({
          include: [
            {
              model: SuleatProduct,
              attributes: ["item_name", "item_code"],
            },
          ],
          attributes: ["item_price", "id"],
          where: {
            product_id: price.product_id,
            createdAt: price.latestCreatedAt,
          },
          raw: true,
        });
        return {
          product_id: price.product_id,
          id: latestItemPrice.id,
          latestItemPrice: latestItemPrice ? latestItemPrice.item_price : null,
          item_name: latestItemPrice["suleatproduct.item_name"],
          item_code: latestItemPrice["suleatproduct.item_code"],
        };
      })
    );
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message:
        error.message ||
        "Some error occurred while fetching the produce price list.",
    });
  }
};

exports.getHistory = async (req, res) => {
  const product_id = req.params.id;
  if (!product_id) {
    return res.status(404).send({ message: "Product ID not found" });
  }

  SuleatPriceList.findAll({
    include:[{
        model:Account,
        attributes:["email"]
    }],
    where: {
      product_id: product_id,
    },
    order: [["createdAt", "desc"]],
  })
    .then(async (data) => {
        res.send(data)
    })
    .catch((err) => {
      console.log(err);
      res
        .status(400)
        .send({
          message:
            "Some error occurred while fetching the produce price list history.",
        });
    });
};

exports.exportExcel = async(req,res) => {
    const workbook = new excelJS.Workbook();

        const latestPrices = await SuleatPriceList.findAll({
          attributes: [
            "product_id",
            [Sequelize.fn("max", Sequelize.col("createdAt")), "latestCreatedAt"],
          ],
    
          group: ["product_id"],
          raw: true,
        });
    
        const result = await Promise.all(
          latestPrices.map(async (price) => {
            const latestItemPrice = await SuleatPriceList.findOne({
              include: [
                {
                  model: SuleatProduct,
                  attributes: ["item_name", "item_code"],
                },
              ],
              attributes: ["item_price", "id"],
              where: {
                product_id: price.product_id,
                createdAt: price.latestCreatedAt,
              },
              raw: true,
            });
            return {
              product_id: price.product_id,
              id: latestItemPrice.id,
              latestItemPrice: latestItemPrice ? latestItemPrice.item_price : null,
              item_name: latestItemPrice["suleatproduct.item_name"],
              item_code: latestItemPrice["suleatproduct.item_code"],
            };
          })
        );
     
  
    const now  =  new Date();
    const value = date.format(now,'DD_MM_YYYY');
    const worksheet = workbook.addWorksheet(`Suleat Product List ${value}`);
  
    const suleatPriceListsData = result;


    worksheet.columns = [
      {header:'Product ID', key:'product_id', width:20},
      {header:'Product Code', key:'item_code', width:30},
      {header:'Product Name', key:'item_name', width:20},
      {header:'Product Price', key:'latestItemPrie', width:20},
    
    ]
    var index = 2
    const row = worksheet.getRow(1)
    var rowLength = 4
    row.outlineLevel = 1;

    //Adding borders and alignments to each cell in row 1 Headers
    for(let i=1; i<=rowLength;i++)
    {
      row.getCell(i).border = {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'}
      };
      row.getCell(i).alignment = { vertical: 'middle', horizontal: 'center' };
    }


    console.log("\n\n\n\n\n")
    console.log("Suleat Price List Data", suleatPriceListsData)
    console.log("\n\n\n\n\n")
    suleatPriceListsData.forEach((item) => {
      worksheet.addRow(item);
      // add a column of new values
      const row = worksheet.getRow(index);
      var rowLength = 4
      row.outlineLevel = 1;

      //Adding borders and alignments to each cell in row
      for(let i=1; i<=rowLength;i++)
      {
        row.getCell(i).border = {
          top: {style:'thin'},
          left: {style:'thin'},
          bottom: {style:'thin'},
          right: {style:'thin'}
        };
        row.getCell(i).alignment = { vertical: 'middle', horizontal: 'center' };
      }
      if (item.latestItemPrice) {
        row.getCell(4).value = parseFloat(item.latestItemPrice);
        row.getCell(4).numFmt = "₱#,##0.00;[Red]-₱#,##0.00";
      }
  
      index++
    });
  
    // Making first line in excel bold
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
  
      // Set the Content-Type and Content-Disposition headers.
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader(`Content-Disposition`, `attachment; filename=SuleatProductList.xlsx`);
  
      return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
  
  }
