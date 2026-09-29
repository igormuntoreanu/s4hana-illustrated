export type TechField = { name: string; description: string };

export type TechTable = {
  name: string;
  description: string;
  fields: TechField[];
};

export type TechApi = { name: string; title: string; href: string };

export type TechView = { name: string; description: string };

export type TechnicalModel = {
  summary: string;
  tables: TechTable[];
  odata?: TechApi;
  cds: TechView[];
};

export const CDS_CATALOG =
  "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ee6ff9b281d8448f96b4fe6c89f2bdc8/5418de55938d1d22e10000000a44147b.html?locale=en-US";

function api(name: string, title: string): TechApi {
  return { name, title, href: `https://api.sap.com/api/${name}/overview` };
}

const f = (name: string, description: string): TechField => ({ name, description });

export const technicalModels: Record<string, TechnicalModel> = {
  "rd-mat": {
    summary: "One material number, then the plant, sales, and valuation slices the other processes read.",
    tables: [
      {
        name: "MARA",
        description: "General material data, shared across plants.",
        fields: [
          f("MATNR", "Material number"),
          f("MTART", "Material type"),
          f("MATKL", "Material group"),
          f("MEINS", "Base unit of measure"),
        ],
      },
      {
        name: "MAKT",
        description: "Material description, by language.",
        fields: [
          f("MATNR", "Material number"),
          f("SPRAS", "Language"),
          f("MAKTX", "Description"),
        ],
      },
      {
        name: "MARC",
        description: "Plant data: planning and procurement.",
        fields: [
          f("MATNR", "Material number"),
          f("WERKS", "Plant"),
          f("BESKZ", "Procurement type"),
          f("DISMM", "MRP type"),
          f("DISPO", "MRP controller"),
        ],
      },
      {
        name: "MVKE",
        description: "Sales data for a sales organization and distribution channel.",
        fields: [
          f("MATNR", "Material number"),
          f("VKORG", "Sales organization"),
          f("VTWEG", "Distribution channel"),
          f("DWERK", "Delivering plant"),
        ],
      },
      {
        name: "MBEW",
        description: "Valuation data. A valuated material posts inventory value into the journal.",
        fields: [
          f("MATNR", "Material number"),
          f("BWKEY", "Valuation area"),
          f("VPRSV", "Price control"),
          f("STPRS", "Standard price"),
          f("BKLAS", "Valuation class"),
        ],
      },
    ],
    odata: api("API_PRODUCT_SRV", "Product Master (A2X)"),
    cds: [
      { name: "I_Product", description: "Product, the general data." },
      { name: "I_ProductPlant", description: "Product at a plant." },
      { name: "I_ProductSalesDelivery", description: "Product sales data." },
      { name: "I_ProductValuation", description: "Product valuation." },
    ],
  },
  "sd-so": {
    summary: "The order header, its items, the schedule lines, and the partner roles.",
    tables: [
      {
        name: "VBAK",
        description: "Sales document header.",
        fields: [
          f("VBELN", "Sales document number"),
          f("AUART", "Sales document type"),
          f("VKORG", "Sales organization"),
          f("VTWEG", "Distribution channel"),
          f("SPART", "Division"),
          f("KUNNR", "Sold-to party"),
          f("NETWR", "Net value"),
          f("WAERK", "Currency"),
          f("BSTNK", "Customer reference"),
          f("GBSTK", "Overall status"),
          f("LFSTK", "Delivery status"),
          f("FKSTK", "Billing status"),
        ],
      },
      {
        name: "VBAP",
        description: "Sales document item.",
        fields: [
          f("VBELN", "Sales document number"),
          f("POSNR", "Item number"),
          f("MATNR", "Material"),
          f("ARKTX", "Item description"),
          f("KWMENG", "Order quantity"),
          f("VRKME", "Sales unit"),
          f("NETWR", "Net value"),
          f("WERKS", "Plant"),
          f("LGORT", "Storage location"),
          f("PSTYV", "Item category"),
        ],
      },
      {
        name: "VBEP",
        description: "Schedule line of a sales item.",
        fields: [
          f("VBELN", "Sales document number"),
          f("POSNR", "Item number"),
          f("ETENR", "Schedule line number"),
          f("WMENG", "Order quantity"),
          f("BMENG", "Confirmed quantity"),
          f("EDATU", "Schedule line date"),
        ],
      },
      {
        name: "VBPA",
        description: "Partner roles on the document, including ship-to and bill-to.",
        fields: [
          f("VBELN", "Sales document number"),
          f("POSNR", "Item, or 000000 for the header"),
          f("PARVW", "Partner function"),
          f("KUNNR", "Partner number"),
        ],
      },
    ],
    odata: api("API_SALES_ORDER_SRV", "Sales Order (A2X)"),
    cds: [
      { name: "I_SalesOrder", description: "Sales order header." },
      { name: "I_SalesOrderItem", description: "Sales order item." },
      { name: "I_SalesOrderScheduleLine", description: "Schedule line." },
    ],
  },
  "sd-pr": {
    summary: "Condition records are the prices you maintain. The price on a document is stored with that document.",
    tables: [
      {
        name: "KONH",
        description: "Condition record header.",
        fields: [
          f("KNUMH", "Condition record number"),
          f("KAPPL", "Application"),
          f("KSCHL", "Condition type"),
          f("KOTABNR", "Condition table"),
          f("DATAB", "Valid from"),
          f("DATBI", "Valid to"),
        ],
      },
      {
        name: "KONP",
        description: "Condition record item: the rate itself.",
        fields: [
          f("KNUMH", "Condition record number"),
          f("KOPOS", "Sequential number of the condition"),
          f("KBETR", "Condition amount"),
          f("KONWA", "Currency or percentage unit"),
          f("KPEIN", "Pricing unit"),
          f("KMEIN", "Condition unit"),
        ],
      },
      {
        name: "Axxx",
        description: "Generated access table. The number depends on the access sequence, so there is no single table for every price.",
        fields: [
          f("KAPPL", "Application"),
          f("KSCHL", "Condition type"),
          f("DATBI", "Validity end, part of the key"),
          f("KNUMH", "Condition record number"),
        ],
      },
      {
        name: "PRCD_ELEMENTS",
        description: "Price elements on a sales document. This replaces the old separate conditions pool.",
        fields: [
          f("KNUMV", "Document condition number"),
          f("KPOSN", "Condition item number"),
          f("KSCHL", "Condition type"),
          f("KBETR", "Condition rate"),
          f("KWERT", "Condition value"),
          f("WAERS", "Currency"),
        ],
      },
    ],
    odata: api("API_SLSPRICINGCONDITIONRECORD_SRV", "Condition Record for Pricing in Sales"),
    cds: [{ name: "I_SlsPrcgConditionRecord", description: "Sales pricing condition record." }],
  },
  "sd-bil": {
    summary: "Billing document header and items. Accounting lines are journal lines, not a second invoice you type.",
    tables: [
      {
        name: "VBRK",
        description: "Billing document header.",
        fields: [
          f("VBELN", "Billing document"),
          f("FKART", "Billing type"),
          f("FKDAT", "Billing date"),
          f("KUNAG", "Sold-to party"),
          f("KUNRG", "Payer"),
          f("NETWR", "Net value"),
          f("WAERK", "Currency"),
          f("BUKRS", "Company code"),
        ],
      },
      {
        name: "VBRP",
        description: "Billing document item.",
        fields: [
          f("VBELN", "Billing document"),
          f("POSNR", "Item"),
          f("MATNR", "Material"),
          f("FKIMG", "Billed quantity"),
          f("VRKME", "Sales unit"),
          f("NETWR", "Net value"),
        ],
      },
    ],
    odata: api("API_BILLING_DOCUMENT_SRV", "Billing Document — Read, Cancel, GetPDF"),
    cds: [
      { name: "I_BillingDocument", description: "Billing document header." },
      { name: "I_BillingDocumentItem", description: "Billing document item." },
    ],
  },
  "sd-con": {
    summary: "A contract is a sales document with a contract type. Release orders are ordinary sales orders with reference.",
    tables: [
      {
        name: "VBAK",
        description: "Contract header. The document type distinguishes a quantity contract from a value contract.",
        fields: [
          f("VBELN", "Contract number"),
          f("AUART", "Contract type"),
          f("KUNNR", "Sold-to party"),
          f("GUEBG", "Valid from"),
          f("GUEEN", "Valid to"),
        ],
      },
      {
        name: "VBAP",
        description: "Contract item, including the target quantity or value.",
        fields: [
          f("VBELN", "Contract number"),
          f("POSNR", "Item"),
          f("MATNR", "Material"),
          f("ZMENG", "Target quantity"),
          f("ZIEME", "Target quantity unit"),
          f("NETWR", "Net value"),
        ],
      },
    ],
    odata: api("API_SALES_CONTRACT_SRV", "Sales Contract (A2X)"),
    cds: [
      { name: "I_SalesContract", description: "Sales contract header." },
      { name: "I_SalesContractItem", description: "Sales contract item." },
    ],
  },
  "fin-gl": {
    summary: "A journal entry is a header plus lines. In S/4HANA the lines that you report on are the universal journal.",
    tables: [
      {
        name: "BKPF",
        description: "Accounting document header.",
        fields: [
          f("BUKRS", "Company code"),
          f("BELNR", "Document number"),
          f("GJAHR", "Fiscal year"),
          f("BLART", "Document type"),
          f("BUDAT", "Posting date"),
          f("WAERS", "Currency"),
        ],
      },
      {
        name: "ACDOCA",
        description: "Universal journal line. This is the line item for the general ledger.",
        fields: [
          f("RBUKRS", "Company code"),
          f("GJAHR", "Fiscal year"),
          f("BELNR", "Document number"),
          f("DOCLN", "Line"),
          f("RACCT", "Account"),
          f("HSL", "Amount in company-code currency"),
          f("RCNTR", "Cost center"),
          f("PRCTR", "Profit center"),
          f("RLDNR", "Ledger"),
        ],
      },
    ],
    odata: api("API_JOURNALENTRYITEMBASIC_SRV", "Journal Entry Item — Read"),
    cds: [
      { name: "I_JournalEntry", description: "Journal entry header." },
      { name: "I_JournalEntryItem", description: "Journal entry line." },
    ],
  },
  "fin-uj": {
    summary: "One journal line carries the account, the amount, and the account assignments that used to live in separate ledgers.",
    tables: [
      {
        name: "ACDOCA",
        description: "Universal journal actual line.",
        fields: [
          f("RLDNR", "Ledger"),
          f("RBUKRS", "Company code"),
          f("GJAHR", "Fiscal year"),
          f("BELNR", "Accounting document"),
          f("DOCLN", "Line"),
          f("RACCT", "Account"),
          f("HSL", "Amount in company-code currency"),
          f("RHCUR", "Company-code currency"),
          f("RCNTR", "Cost center"),
          f("PRCTR", "Profit center"),
          f("BUDAT", "Posting date"),
        ],
      },
    ],
    odata: api("API_JOURNALENTRYITEMBASIC_SRV", "Journal Entry Item — Read"),
    cds: [{ name: "I_JournalEntryItem", description: "Journal entry line, the usual read interface over the universal journal." }],
  },
  "fin-ap": {
    summary: "A logistics supplier invoice is matched to the purchase order. The open item is a journal line.",
    tables: [
      {
        name: "RBKP",
        description: "Logistics invoice header.",
        fields: [
          f("BELNR", "Invoice document"),
          f("GJAHR", "Fiscal year"),
          f("BUKRS", "Company code"),
          f("LIFNR", "Supplier"),
          f("BLDAT", "Invoice date"),
          f("XBLNR", "Reference"),
          f("RMWWR", "Gross invoice amount"),
          f("WAERS", "Currency"),
        ],
      },
      {
        name: "RSEG",
        description: "Logistics invoice item, the match to the purchase order.",
        fields: [
          f("BELNR", "Invoice document"),
          f("GJAHR", "Fiscal year"),
          f("BUZEI", "Item"),
          f("EBELN", "Purchase order"),
          f("EBELP", "Purchase order item"),
          f("MENGE", "Quantity"),
          f("WRBTR", "Amount"),
        ],
      },
    ],
    odata: api("API_SUPPLIERINVOICE_PROCESS_SRV", "Supplier Invoice"),
    cds: [{ name: "I_SupplierInvoice", description: "Supplier invoice." }],
  },
  "fin-ar": {
    summary: "A customer open item is a journal line. There is no separate open-item table to design new reports on.",
    tables: [
      {
        name: "ACDOCA",
        description: "Customer line in the universal journal, posted from billing or from a finance invoice.",
        fields: [
          f("KUNNR", "Customer"),
          f("BELNR", "Document number"),
          f("RBUKRS", "Company code"),
          f("GJAHR", "Fiscal year"),
          f("HSL", "Amount in company-code currency"),
          f("NETDT", "Due date"),
          f("ZTERM", "Payment terms"),
        ],
      },
    ],
    odata: api("API_JOURNALENTRYITEMBASIC_SRV", "Journal Entry Item — Read"),
    cds: [{ name: "I_JournalEntryItem", description: "Journal line, including customer open items." }],
  },
  "fin-aa": {
    summary: "The asset master, and the values, which post into the universal journal.",
    tables: [
      {
        name: "ANLA",
        description: "Asset master, general data.",
        fields: [
          f("BUKRS", "Company code"),
          f("ANLN1", "Asset main number"),
          f("ANLN2", "Asset subnumber"),
          f("ANLKL", "Asset class"),
          f("TXT50", "Description"),
          f("AKTIV", "Capitalization date"),
        ],
      },
      {
        name: "ANLZ",
        description: "Time-dependent asset assignments, such as the cost center.",
        fields: [
          f("BUKRS", "Company code"),
          f("ANLN1", "Asset main number"),
          f("ANLN2", "Asset subnumber"),
          f("KOSTL", "Cost center"),
        ],
      },
    ],
    odata: api("sap-s4-CE_FIXEDASSET_0001-v1", "Fixed Asset — Master Data"),
    cds: [{ name: "I_FixedAsset", description: "Fixed asset master data." }],
  },
  "pr-op": {
    summary: "Purchase order header and item.",
    tables: [
      {
        name: "EKKO",
        description: "Purchasing document header.",
        fields: [
          f("EBELN", "Purchasing document"),
          f("BSTYP", "Purchasing document category"),
          f("BSART", "Purchasing document type"),
          f("LIFNR", "Supplier"),
          f("EKORG", "Purchasing organization"),
          f("EKGRP", "Purchasing group"),
          f("BUKRS", "Company code"),
          f("WAERS", "Currency"),
        ],
      },
      {
        name: "EKPO",
        description: "Purchasing document item.",
        fields: [
          f("EBELN", "Purchasing document"),
          f("EBELP", "Item"),
          f("MATNR", "Material"),
          f("TXZ01", "Short text"),
          f("MENGE", "Order quantity"),
          f("MEINS", "Order unit"),
          f("NETPR", "Net price"),
          f("WERKS", "Plant"),
        ],
      },
    ],
    odata: api("API_PURCHASEORDER_PROCESS_SRV", "Purchase Order"),
    cds: [
      { name: "I_PurchaseOrder", description: "Purchase order header." },
      { name: "I_PurchaseOrderItem", description: "Purchase order item." },
    ],
  },
  "pr-src": {
    summary: "A purchasing contract uses the same purchasing document tables. The document category marks it as a contract.",
    tables: [
      {
        name: "EKKO",
        description: "Contract header. Document category K is a contract.",
        fields: [
          f("EBELN", "Contract"),
          f("BSTYP", "Document category"),
          f("BSART", "Contract type"),
          f("LIFNR", "Supplier"),
          f("KDATB", "Validity start"),
          f("KDATE", "Validity end"),
        ],
      },
      {
        name: "EKPO",
        description: "Contract item, with the target quantity.",
        fields: [
          f("EBELN", "Contract"),
          f("EBELP", "Item"),
          f("MATNR", "Material"),
          f("KTMNG", "Target quantity"),
          f("MEINS", "Order unit"),
        ],
      },
    ],
    odata: api("API_PURCHASECONTRACT_PROCESS_SRV_0002", "Purchase Contracts"),
    cds: [
      { name: "I_PurchaseContract", description: "Purchase contract header." },
      { name: "I_PurchaseContractItem", description: "Purchase contract item." },
    ],
  },
  "pr-sup": {
    summary: "The supplier is a business partner. Company-code and purchasing data still hang off the supplier number.",
    tables: [
      {
        name: "BUT000",
        description: "Business partner general data.",
        fields: [
          f("PARTNER", "Business partner number"),
          f("NAME_ORG1", "Organization name"),
          f("BU_GROUP", "Grouping"),
        ],
      },
      {
        name: "LFB1",
        description: "Supplier company-code data.",
        fields: [
          f("LIFNR", "Supplier"),
          f("BUKRS", "Company code"),
          f("AKONT", "Reconciliation account"),
          f("ZTERM", "Payment terms"),
        ],
      },
      {
        name: "LFM1",
        description: "Supplier purchasing data.",
        fields: [
          f("LIFNR", "Supplier"),
          f("EKORG", "Purchasing organization"),
          f("WAERS", "Order currency"),
          f("INCO1", "Incoterms"),
        ],
      },
    ],
    odata: api("API_BUSINESS_PARTNER", "Business Partner (A2X)"),
    cds: [
      { name: "I_BusinessPartner", description: "Business partner." },
      { name: "I_Supplier", description: "Supplier." },
    ],
  },
  "pr-iv": {
    summary: "Same logistics invoice as accounts payable: header, and the item that matches the purchase order.",
    tables: [
      {
        name: "RBKP",
        description: "Logistics invoice header.",
        fields: [
          f("BELNR", "Invoice document"),
          f("GJAHR", "Fiscal year"),
          f("LIFNR", "Supplier"),
          f("BLDAT", "Invoice date"),
          f("RMWWR", "Gross amount"),
          f("WAERS", "Currency"),
        ],
      },
      {
        name: "RSEG",
        description: "Invoice item matched to the purchase order.",
        fields: [
          f("EBELN", "Purchase order"),
          f("EBELP", "Item"),
          f("MENGE", "Quantity"),
          f("WRBTR", "Amount"),
        ],
      },
    ],
    odata: api("API_SUPPLIERINVOICE_PROCESS_SRV", "Supplier Invoice"),
    cds: [{ name: "I_SupplierInvoice", description: "Supplier invoice." }],
  },
  "sc-im": {
    summary: "A goods movement is a material document. New movements are stored in the universal inventory table, and a valuated movement also posts a journal line.",
    tables: [
      {
        name: "MATDOC",
        description: "Material document item. This is the inventory line in S/4HANA.",
        fields: [
          f("MBLNR", "Material document"),
          f("MJAHR", "Material document year"),
          f("ZEILE", "Item"),
          f("BWART", "Movement type"),
          f("MATNR", "Material"),
          f("MENGE", "Quantity"),
          f("MEINS", "Unit"),
          f("WERKS", "Plant"),
          f("LGORT", "Storage location"),
          f("BUDAT", "Posting date"),
        ],
      },
    ],
    odata: api("API_MATERIAL_DOCUMENT_SRV", "Material Documents — Read, Create"),
    cds: [{ name: "I_MaterialDocumentItem", description: "Material document item." }],
  },
  "sc-ewm": {
    summary: "A warehouse task is the putaway or pick instruction inside embedded warehouse management.",
    tables: [
      {
        name: "/SCWM/ORDIM_C",
        description: "Confirmed warehouse task. Open tasks use the same structure before confirmation.",
        fields: [
          f("LGNUM", "Warehouse number"),
          f("TANUM", "Warehouse task"),
          f("PROCTY", "Warehouse process type"),
          f("MATID", "Product"),
          f("VSOLM", "Target quantity"),
          f("VLPLA", "Source storage bin"),
          f("NLPLA", "Destination storage bin"),
        ],
      },
    ],
    odata: api("WAREHOUSEORDER_0001", "Warehouse Order and Task (A2X)"),
    cds: [],
  },
  "sc-batch": {
    summary: "A batch is a quantity of one material that shares characteristics.",
    tables: [
      {
        name: "MCH1",
        description: "Batch, cross-plant.",
        fields: [
          f("MATNR", "Material"),
          f("CHARG", "Batch"),
          f("HSDAT", "Date of manufacture"),
          f("VFDAT", "Shelf-life expiration date"),
        ],
      },
    ],
    odata: api("API_BATCH_SRV", "Batch Master Record"),
    cds: [{ name: "I_Batch", description: "Batch." }],
  },
  "rd-bom": {
    summary: "A bill of material is a header, a link to the material and plant, and the components.",
    tables: [
      {
        name: "MAST",
        description: "Link from a material and plant to a bill of material.",
        fields: [
          f("MATNR", "Material"),
          f("WERKS", "Plant"),
          f("STLAN", "BOM usage"),
          f("STLNR", "Bill of material"),
          f("STLAL", "Alternative"),
        ],
      },
      {
        name: "STKO",
        description: "Bill of material header.",
        fields: [
          f("STLNR", "Bill of material"),
          f("STLAL", "Alternative"),
          f("BMENG", "Base quantity"),
        ],
      },
      {
        name: "STPO",
        description: "Bill of material component.",
        fields: [
          f("STLNR", "Bill of material"),
          f("POSNR", "Item"),
          f("IDNRK", "Component"),
          f("MENGE", "Quantity"),
          f("MEINS", "Unit"),
        ],
      },
    ],
    odata: api("API_BILL_OF_MATERIAL_SRV_0002", "Bills of Material"),
    cds: [
      { name: "I_BillOfMaterial", description: "Bill of material header." },
      { name: "I_BOMComponent", description: "Bill of material component." },
    ],
  },
  "pp-eng": {
    summary: "A production version points at one bill of material alternative and one routing.",
    tables: [
      {
        name: "MKAL",
        description: "Production version.",
        fields: [
          f("MATNR", "Material"),
          f("WERKS", "Plant"),
          f("VERID", "Production version"),
          f("STLAL", "BOM alternative"),
          f("PLNNR", "Routing group"),
          f("ALNAL", "Routing group counter"),
        ],
      },
    ],
    cds: [{ name: "I_ProductionVersion", description: "Production version." }],
  },
  "pp-mrp": {
    summary: "A planned order is the proposal from the planning run, before it becomes a production order or a purchase requisition.",
    tables: [
      {
        name: "PLAF",
        description: "Planned order.",
        fields: [
          f("PLNUM", "Planned order"),
          f("MATNR", "Material"),
          f("PLWRK", "Planning plant"),
          f("GSMNG", "Total planned quantity"),
          f("PSTTR", "Start date"),
          f("PEDTR", "Finish date"),
        ],
      },
    ],
    odata: api("API_PLANNED_ORDERS", "Planned Order"),
    cds: [{ name: "I_PlannedOrder", description: "Planned order." }],
  },
  "pp-op": {
    summary: "A production order has a header, the material to be produced, and the components to issue.",
    tables: [
      {
        name: "AUFK",
        description: "Order master, shared by production and other orders.",
        fields: [
          f("AUFNR", "Order"),
          f("AUART", "Order type"),
          f("KTEXT", "Description"),
          f("BUKRS", "Company code"),
          f("WERKS", "Plant"),
        ],
      },
      {
        name: "AFKO",
        description: "Production order header.",
        fields: [
          f("AUFNR", "Order"),
          f("PLNBEZ", "Material to produce"),
          f("GAMNG", "Total order quantity"),
          f("GSTRP", "Basic start"),
          f("GLTRP", "Basic finish"),
        ],
      },
      {
        name: "RESB",
        description: "Component reservation on the order.",
        fields: [
          f("AUFNR", "Order"),
          f("MATNR", "Component"),
          f("BDMNG", "Requirement quantity"),
          f("ENMNG", "Issued quantity"),
          f("MEINS", "Unit"),
        ],
      },
    ],
    odata: api("API_PRODUCTION_ORDER_2_SRV", "Production Order (Version 2)"),
    cds: [{ name: "I_ManufacturingOrder", description: "Manufacturing order." }],
  },
  "pp-qm": {
    summary: "An inspection lot is created by a triggering event, such as a goods receipt, and closed by a usage decision.",
    tables: [
      {
        name: "QALS",
        description: "Inspection lot.",
        fields: [
          f("PRUEFLOS", "Inspection lot"),
          f("MATNR", "Material"),
          f("WERKS", "Plant"),
          f("LOSMENGE", "Lot quantity"),
          f("ART", "Inspection type"),
        ],
      },
    ],
    odata: api("API_INSPECTIONLOT_SRV", "Inspection Lot"),
    cds: [{ name: "I_InspectionLot", description: "Inspection lot." }],
  },
  "pp-sub": {
    summary: "Subcontracting is a purchase order item. The components you provide are reservations against that item.",
    tables: [
      {
        name: "EKPO",
        description: "Purchase order item. Subcontracting is an item category on this item.",
        fields: [
          f("EBELN", "Purchase order"),
          f("EBELP", "Item"),
          f("MATNR", "Material to receive"),
          f("MENGE", "Quantity"),
          f("PSTYP", "Item category"),
          f("WERKS", "Plant"),
        ],
      },
      {
        name: "RESB",
        description: "Components provided to the supplier.",
        fields: [
          f("MATNR", "Component"),
          f("BDMNG", "Requirement quantity"),
          f("MEINS", "Unit"),
        ],
      },
    ],
    odata: api("API_PURCHASEORDER_PROCESS_SRV", "Purchase Order"),
    cds: [{ name: "I_PurchaseOrderItem", description: "Purchase order item, including a subcontracting item." }],
  },
  "sv-ord": {
    summary: "Read the service order through the released service order API. The on-premise table layout is release-sensitive, so it is not listed here.",
    tables: [],
    odata: api("API_SERVICE_ORDER_SRV", "Service Order (A2X)"),
    cds: [
      { name: "I_ServiceOrder", description: "Service order header." },
      { name: "I_ServiceOrderItem", description: "Service order item." },
    ],
  },
  "am-req": {
    summary: "A maintenance request is a notification. The phase model screens it before an order is created.",
    tables: [
      {
        name: "QMEL",
        description: "Notification header, used for the maintenance request.",
        fields: [
          f("QMNUM", "Notification"),
          f("QMART", "Notification type"),
          f("QMTXT", "Description"),
          f("PRIOK", "Priority"),
          f("EQUNR", "Equipment"),
          f("TPLNR", "Functional location"),
          f("QMDAT", "Notification date"),
        ],
      },
    ],
    odata: api("API_MAINTNOTIFICATION", "Maintenance Notification"),
    cds: [{ name: "I_MaintenanceNotification", description: "Maintenance notification." }],
  },
  "am-pm": {
    summary: "A maintenance order is an order header plus the maintenance-specific data and the operations.",
    tables: [
      {
        name: "AUFK",
        description: "Order master.",
        fields: [
          f("AUFNR", "Order"),
          f("AUART", "Order type"),
          f("KTEXT", "Description"),
          f("BUKRS", "Company code"),
        ],
      },
      {
        name: "AFIH",
        description: "Maintenance order header.",
        fields: [
          f("AUFNR", "Order"),
          f("EQUNR", "Equipment"),
          f("IWERK", "Planning plant"),
          f("ADDAT", "Reference date"),
        ],
      },
    ],
    odata: api("API_MAINTENANCEORDER", "Maintenance Order — Read"),
    cds: [{ name: "I_MaintenanceOrder", description: "Maintenance order." }],
  },
  "hr-core": {
    summary: "On-premise core HR is still the personnel infotypes. The employee is also a business partner.",
    tables: [
      {
        name: "PA0001",
        description: "Organizational assignment.",
        fields: [
          f("PERNR", "Personnel number"),
          f("BUKRS", "Company code"),
          f("KOSTL", "Cost center"),
          f("PLANS", "Position"),
          f("BEGDA", "Start date"),
          f("ENDDA", "End date"),
        ],
      },
      {
        name: "PA0002",
        description: "Personal data.",
        fields: [
          f("PERNR", "Personnel number"),
          f("NACHN", "Last name"),
          f("VORNA", "First name"),
          f("BEGDA", "Start date"),
          f("ENDDA", "End date"),
        ],
      },
    ],
    cds: [{ name: "I_WorkforcePerson", description: "Workforce person, the business-partner view of the employee." }],
  },
  "hr-time": {
    summary: "A time-sheet entry records hours against a receiver such as a cost center or an order.",
    tables: [
      {
        name: "CATSDB",
        description: "Time sheet record.",
        fields: [
          f("PERNR", "Personnel number"),
          f("WORKDATE", "Work date"),
          f("CATSHOURS", "Hours"),
          f("RKOSTL", "Receiver cost center"),
          f("RAUFNR", "Receiver order"),
        ],
      },
    ],
    odata: api("API_MANAGE_WORKFORCE_TIMESHEET", "Workforce Timesheet"),
    cds: [{ name: "I_TimeSheetRecord", description: "Time sheet record." }],
  },
  "ps-plan": {
    summary: "A project definition and its work breakdown structure.",
    tables: [
      {
        name: "PROJ",
        description: "Project definition.",
        fields: [
          f("PSPID", "Project"),
          f("POST1", "Description"),
          f("BUKRS", "Company code"),
          f("PLFAZ", "Start"),
          f("PLSEZ", "Finish"),
        ],
      },
      {
        name: "PRPS",
        description: "Work breakdown structure element.",
        fields: [
          f("POSID", "WBS element"),
          f("POST1", "Description"),
          f("PSPHI", "Project"),
        ],
      },
    ],
    cds: [
      { name: "I_Project", description: "Project definition." },
      { name: "I_WBSElement", description: "WBS element." },
    ],
  },
  "ps-fin": {
    summary: "Project cost is a journal line with the WBS element filled in. There is no separate project totals table to report from.",
    tables: [
      {
        name: "ACDOCA",
        description: "Journal line charged to a WBS element.",
        fields: [
          f("PS_POSID", "WBS element"),
          f("RACCT", "Account"),
          f("HSL", "Amount in company-code currency"),
          f("RHCUR", "Company-code currency"),
          f("BUDAT", "Posting date"),
        ],
      },
    ],
    odata: api("API_JOURNALENTRYITEMBASIC_SRV", "Journal Entry Item — Read"),
    cds: [{ name: "I_JournalEntryItem", description: "Journal line, including project cost." }],
  },
  "ps-log": {
    summary: "A purchase for a project is a purchase order item whose account assignment is the WBS element.",
    tables: [
      {
        name: "EKKN",
        description: "Account assignment on a purchasing item.",
        fields: [
          f("EBELN", "Purchase order"),
          f("EBELP", "Item"),
          f("PS_PSP_PNR", "WBS element, internal number"),
          f("MENGE", "Quantity"),
          f("NETWR", "Net value"),
        ],
      },
    ],
    odata: api("API_PURCHASEORDER_PROCESS_SRV", "Purchase Order"),
    cds: [{ name: "I_PurchaseOrderItem", description: "Purchase order item, including one charged to a project." }],
  },
  "wc-cr01": {
    summary: "The work center is the place a routing operation runs. Its costing link is a cost center and an activity type.",
    tables: [
      {
        name: "CRHD",
        description: "Work center header.",
        fields: [
          f("ARBPL", "Work center"),
          f("WERKS", "Plant"),
          f("VERWE", "Work center category"),
        ],
      },
      {
        name: "CRTX",
        description: "Work center description.",
        fields: [
          f("OBJID", "Work center object"),
          f("SPRAS", "Language"),
          f("KTEXT", "Description"),
        ],
      },
      {
        name: "CRCO",
        description: "Cost center assignment on the work center.",
        fields: [
          f("KOSTL", "Cost center"),
          f("LSTAR", "Activity type"),
        ],
      },
    ],
    cds: [{ name: "I_WorkCenter", description: "Work center." }],
  },
  "fl-il01": {
    summary: "A functional location is the hierarchy of places. Equipment is installed into a location, not the other way around.",
    tables: [
      {
        name: "IFLOT",
        description: "Functional location.",
        fields: [
          f("TPLNR", "Functional location"),
          f("PLTXT", "Description"),
          f("TPLMA", "Superior functional location"),
          f("SWERK", "Maintenance plant"),
        ],
      },
    ],
    cds: [{ name: "I_FunctionalLocation", description: "Functional location." }],
  },
  "eq-ie01": {
    summary: "Equipment is the individual object. The location it sits in is stored on the equipment time segment.",
    tables: [
      {
        name: "EQUI",
        description: "Equipment general data.",
        fields: [
          f("EQUNR", "Equipment"),
          f("EQTYP", "Equipment category"),
        ],
      },
      {
        name: "EQKT",
        description: "Equipment description.",
        fields: [
          f("EQUNR", "Equipment"),
          f("SPRAS", "Language"),
          f("EQKTX", "Description"),
        ],
      },
      {
        name: "EQUZ",
        description: "Equipment time segment, including where it is installed.",
        fields: [
          f("EQUNR", "Equipment"),
          f("DATBI", "Valid to"),
          f("TPLNR", "Functional location"),
          f("SWERK", "Maintenance plant"),
        ],
      },
    ],
    cds: [{ name: "I_Equipment", description: "Equipment." }],
  },
  "bp-one": {
    summary: "One business partner number. Customer and supplier are roles on that number.",
    tables: [
      {
        name: "BUT000",
        description: "Business partner general data.",
        fields: [
          f("PARTNER", "Business partner number"),
          f("NAME_ORG1", "Organization name"),
          f("BU_GROUP", "Grouping"),
        ],
      },
      {
        name: "BUT100",
        description: "Role assigned to the business partner.",
        fields: [
          f("PARTNER", "Business partner number"),
          f("RLTYP", "Role"),
        ],
      },
    ],
    odata: api("API_BUSINESS_PARTNER", "Business Partner (A2X)"),
    cds: [{ name: "I_BusinessPartner", description: "Business partner." }],
  },
  "bp-cust": {
    summary: "The customer role adds company-code and sales-area data. It does not create a second partner.",
    tables: [
      {
        name: "KNA1",
        description: "Customer general data.",
        fields: [
          f("KUNNR", "Customer"),
          f("NAME1", "Name"),
          f("LAND1", "Country"),
        ],
      },
      {
        name: "KNVV",
        description: "Customer sales-area data.",
        fields: [
          f("KUNNR", "Customer"),
          f("VKORG", "Sales organization"),
          f("VTWEG", "Distribution channel"),
          f("SPART", "Division"),
          f("WAERS", "Currency"),
        ],
      },
    ],
    odata: api("API_BUSINESS_PARTNER", "Business Partner (A2X)"),
    cds: [{ name: "I_Customer", description: "Customer." }],
  },
  ks01: {
    summary: "The cost center is the master. Journal lines, assets, and work centers point at it. They do not each own a copy.",
    tables: [
      {
        name: "CSKS",
        description: "Cost center master.",
        fields: [
          f("KOKRS", "Controlling area"),
          f("KOSTL", "Cost center"),
          f("DATAB", "Valid from"),
          f("DATBI", "Valid to"),
          f("BUKRS", "Company code"),
          f("VERAK", "Person responsible"),
        ],
      },
      {
        name: "CSKT",
        description: "Cost center name.",
        fields: [
          f("KOSTL", "Cost center"),
          f("SPRAS", "Language"),
          f("KTEXT", "Name"),
        ],
      },
    ],
    cds: [{ name: "I_CostCenter", description: "Cost center." }],
  },
  "sv-prod": {
    summary: "A service product is a material. The labor item on a service order points at it.",
    tables: [
      {
        name: "MARA",
        description: "General material data. A service product uses a service material type.",
        fields: [
          f("MATNR", "Material"),
          f("MTART", "Material type"),
          f("MEINS", "Base unit of measure"),
        ],
      },
      {
        name: "MAKT",
        description: "Material description.",
        fields: [
          f("MATNR", "Material"),
          f("SPRAS", "Language"),
          f("MAKTX", "Description"),
        ],
      },
    ],
    odata: api("API_PRODUCT_SRV", "Product Master (A2X)"),
    cds: [{ name: "I_Product", description: "Product, including a service product." }],
  },
};
