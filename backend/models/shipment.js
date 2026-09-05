const Sequelize = require("sequelize");

module.exports = class Shipment extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        export_no: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
          comment: "출고 넘버 (예: EK-260901)",
        },
        vessel_name: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: "모선명 (예: MSC DIANA)",
        },
        voyage: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: "항차 번호 (예: GO634N)",
        },
        carrier: {
          type: Sequelize.STRING(50),
          allowNull: true,
          defaultValue: "MSC",
          comment: "선사명",
        },
        pol: {
          type: Sequelize.STRING(30),
          allowNull: true,
          defaultValue: "KRPUS",
          comment: "출발항",
        },
        pod: {
          type: Sequelize.STRING(30),
          allowNull: true,
          defaultValue: "USLGB",
          comment: "도착항",
        },
        etd: {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: "출항 예정일",
        },
        eta: {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: "도착 예정일",
        },
        doc_closing_date: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: "서류 마감일 (S/I Cut-off)",
        },
        cargo_closing_date: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: "CY 반입 마감일 (Container Yard Cut-off)",
        },
        vessel_imo: {
          type: Sequelize.STRING(20),
          allowNull: true,
          comment: "선박 식별 IMO 코드",
        },
        shipper: {
          type: Sequelize.STRING(100),
          allowNull: true,
          defaultValue: "NEXUS ELECTRONICS CO., LTD.",
          comment: "송하인/수출자",
        },
        consignee: {
          type: Sequelize.STRING(100),
          allowNull: true,
          defaultValue: "GLOBAL DYNAMICS INC.",
          comment: "수하인/수입자",
        },
        item_summary: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: "출하 품목 요약 (품목수, CBM, 무게 등 JSON or 텍스트)",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        paranoid: false,
        modelName: "Shipment",
        tableName: "shipments",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
};
