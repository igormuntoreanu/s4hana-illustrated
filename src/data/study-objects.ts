export type StudyField = { label: string; value: string };

export type StudyGroup = { title: string; fields: StudyField[] };

export type StudyTable = { title: string; columns: string[]; rows: string[][] };

export type StudyObject = {
  eyebrow: string;
  title: string;
  subtitle: string;
  status?: string;
  groups: StudyGroup[];
  tables?: StudyTable[];
};

/** Product help for SAP S/4HANA on-premise. Sample values are not a live system. */
export const S4_HELP = "https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE";

export const studyObjects: Record<string, StudyObject> = {
  "rd-mat": {
    eyebrow: "Product",
    title: "Material TG11",
    subtitle: "Trading good · base unit PC",
    status: "Active",
    groups: [
      {
        title: "Basic data",
        fields: [
          { label: "Material", value: "TG11" },
          { label: "Description", value: "Trading good, regular" },
          { label: "Material type", value: "Trading good" },
          { label: "Base unit", value: "PC" },
          { label: "Material group", value: "L001" },
        ],
      },
      {
        title: "Plant 1010",
        fields: [
          { label: "Procurement type", value: "External" },
          { label: "MRP type", value: "Plan at plant" },
        ],
      },
      {
        title: "Sales",
        fields: [
          { label: "Sales organization", value: "1010" },
          { label: "Distribution channel", value: "10" },
          { label: "Delivering plant", value: "1010" },
        ],
      },
      {
        title: "Valuation",
        fields: [
          { label: "Valuation area", value: "1010" },
          { label: "Price control", value: "Standard price" },
          { label: "Standard price", value: "480.00 EUR" },
          { label: "Valuation class", value: "Trading goods" },
        ],
      },
    ],
  },
  "sd-so": {
    eyebrow: "Sales document",
    title: "Standard order 1400000123",
    subtitle: "Domestic customer · EUR 12,400.00",
    status: "Being processed",
    groups: [
      {
        title: "Identification",
        fields: [
          { label: "Sales document", value: "1400000123" },
          { label: "Document type", value: "Standard order" },
          { label: "Document category", value: "Order" },
        ],
      },
      {
        title: "Sales area",
        fields: [
          { label: "Sales organization", value: "1010 · Domestic sales" },
          { label: "Distribution channel", value: "10 · Direct" },
          { label: "Division", value: "00 · Product" },
        ],
      },
      {
        title: "Partners",
        fields: [
          { label: "Sold-to party", value: "10100001 · Domestic customer" },
          { label: "Ship-to party", value: "10100001 · Domestic customer" },
          { label: "Bill-to party", value: "10100001 · Domestic customer" },
        ],
      },
      {
        title: "Dates",
        fields: [
          { label: "Created on", value: "12 Mar 2026" },
          { label: "Document date", value: "12 Mar 2026" },
          { label: "Requested delivery", value: "26 Mar 2026" },
        ],
      },
      {
        title: "Status",
        fields: [
          { label: "Overall status", value: "Being processed" },
          { label: "Delivery status", value: "Not delivered" },
          { label: "Billing status", value: "Not invoiced" },
        ],
      },
      {
        title: "Value",
        fields: [
          { label: "Net value", value: "12,400.00" },
          { label: "Currency", value: "EUR" },
        ],
      },
      {
        title: "Customer reference",
        fields: [
          { label: "Customer reference", value: "PO-77821" },
          { label: "Reference date", value: "11 Mar 2026" },
        ],
      },
    ],
    tables: [
      {
        title: "Items",
        columns: ["Item", "Material", "Description", "Quantity", "Unit", "Net value", "Plant", "Item type", "Delivery"],
        rows: [
          ["10", "TG11", "Trading good, regular", "10", "PC", "4,800.00", "1010", "Standard item", "Relevant"],
          ["20", "TG12", "Trading good, regular", "4", "PC", "7,600.00", "1010", "Standard item", "Relevant"],
        ],
      },
      {
        title: "Schedule lines",
        columns: ["Item", "Line", "Confirmed quantity", "Unit", "Confirmed date"],
        rows: [
          ["10", "1", "10", "PC", "26 Mar 2026"],
          ["20", "1", "4", "PC", "26 Mar 2026"],
        ],
      },
    ],
  },
  "sd-pr": {
    eyebrow: "Price condition",
    title: "Base price for TG11",
    subtitle: "Customer 10100001 · valid this year",
    status: "Released",
    groups: [
      {
        title: "Condition",
        fields: [
          { label: "Condition type", value: "Price" },
          { label: "Amount", value: "480.00" },
          { label: "Currency", value: "EUR" },
          { label: "Pricing unit", value: "1 PC" },
        ],
      },
      {
        title: "Who it applies to",
        fields: [
          { label: "Sales organization", value: "1010" },
          { label: "Customer", value: "10100001 · Domestic customer" },
          { label: "Material", value: "TG11" },
        ],
      },
      {
        title: "Validity",
        fields: [
          { label: "Valid from", value: "01 Jan 2026" },
          { label: "Valid to", value: "31 Dec 2026" },
        ],
      },
    ],
  },
  "sd-bil": {
    eyebrow: "Billing document",
    title: "Invoice 90001234",
    subtitle: "After goods issue of order 1400000123",
    status: "Posted to accounting",
    groups: [
      {
        title: "Identification",
        fields: [
          { label: "Billing document", value: "90001234" },
          { label: "Billing type", value: "Invoice" },
          { label: "Billing date", value: "28 Mar 2026" },
        ],
      },
      {
        title: "Customer",
        fields: [
          { label: "Sold-to party", value: "10100001 · Domestic customer" },
          { label: "Payer", value: "10100001 · Domestic customer" },
        ],
      },
      {
        title: "Value",
        fields: [
          { label: "Net value", value: "12,400.00" },
          { label: "Tax", value: "2,356.00" },
          { label: "Currency", value: "EUR" },
        ],
      },
    ],
    tables: [
      {
        title: "Items",
        columns: ["Item", "Material", "Billed quantity", "Unit", "Net value"],
        rows: [
          ["10", "TG11", "10", "PC", "4,800.00"],
          ["20", "TG12", "4", "PC", "7,600.00"],
        ],
      },
    ],
  },
  "sd-con": {
    eyebrow: "Sales contract",
    title: "Quantity contract 40000088",
    subtitle: "Open quantity still available to release",
    status: "Open",
    groups: [
      {
        title: "Identification",
        fields: [
          { label: "Contract", value: "40000088" },
          { label: "Contract type", value: "Quantity contract" },
          { label: "Sold-to party", value: "10100001 · Domestic customer" },
        ],
      },
      {
        title: "Validity",
        fields: [
          { label: "Valid from", value: "01 Jan 2026" },
          { label: "Valid to", value: "31 Dec 2026" },
        ],
      },
    ],
    tables: [
      {
        title: "Items",
        columns: ["Item", "Material", "Target quantity", "Released", "Open", "Unit"],
        rows: [["10", "TG11", "1,000", "120", "880", "PC"]],
      },
    ],
  },
  "fin-gl": {
    eyebrow: "Journal entry",
    title: "Document 100000214 · 2026",
    subtitle: "Company 1010 · ledger 0L",
    status: "Posted",
    groups: [
      {
        title: "Header",
        fields: [
          { label: "Document number", value: "100000214" },
          { label: "Company code", value: "1010" },
          { label: "Fiscal year", value: "2026" },
          { label: "Document type", value: "General ledger posting" },
          { label: "Posting date", value: "31 Mar 2026" },
          { label: "Currency", value: "EUR" },
        ],
      },
    ],
    tables: [
      {
        title: "Lines",
        columns: ["Line", "Account", "Description", "Debit", "Credit", "Cost center"],
        rows: [
          ["1", "400000", "Revenue adjustment", "", "1,200.00", ""],
          ["2", "610000", "Operating expense", "1,200.00", "", "101001"],
        ],
      },
    ],
  },
  "fin-uj": {
    eyebrow: "Journal line",
    title: "One posting, several views",
    subtitle: "Company 1010 · ledger 0L · March 2026",
    groups: [
      {
        title: "The line",
        fields: [
          { label: "Account", value: "610000 · Operating expense" },
          { label: "Amount", value: "1,200.00 EUR" },
          { label: "Posting date", value: "31 Mar 2026" },
          { label: "Cost center", value: "101001" },
          { label: "Profit center", value: "YB101" },
          { label: "Ledger", value: "0L · Leading" },
        ],
      },
    ],
  },
  "fin-ap": {
    eyebrow: "Supplier invoice",
    title: "Invoice 5105600123",
    subtitle: "Matched to a purchase order and a goods receipt",
    status: "Posted",
    groups: [
      {
        title: "Invoice",
        fields: [
          { label: "Supplier", value: "10300001 · Alpine Components" },
          { label: "Invoice date", value: "18 Mar 2026" },
          { label: "Reference", value: "ALP-2026-441" },
          { label: "Amount", value: "8,640.00 EUR" },
          { label: "Company code", value: "1010" },
        ],
      },
    ],
    tables: [
      {
        title: "Match",
        columns: ["Purchase order", "Item", "Received", "Invoiced", "Difference"],
        rows: [["4500002211", "10", "40 PC", "40 PC", "Within tolerance"]],
      },
    ],
  },
  "fin-ar": {
    eyebrow: "Customer invoice",
    title: "Open item 90001234",
    subtitle: "Posted from billing · waiting for payment",
    status: "Open",
    groups: [
      {
        title: "Item",
        fields: [
          { label: "Customer", value: "10100001 · Domestic customer" },
          { label: "Document", value: "90001234" },
          { label: "Document type", value: "Customer invoice from billing" },
          { label: "Amount", value: "14,756.00 EUR" },
          { label: "Due on", value: "27 Apr 2026" },
          { label: "Payment terms", value: "30 days net" },
        ],
      },
    ],
  },
  "fin-aa": {
    eyebrow: "Fixed asset",
    title: "Asset 200010 · 0",
    subtitle: "Company 1010 · machinery",
    status: "Capitalized",
    groups: [
      {
        title: "Asset",
        fields: [
          { label: "Asset", value: "200010-0" },
          { label: "Description", value: "Packaging line, hall 2" },
          { label: "Asset class", value: "Machinery" },
          { label: "Company code", value: "1010" },
          { label: "Cost center", value: "101014" },
          { label: "Capitalized on", value: "01 Feb 2026" },
        ],
      },
    ],
  },
  "pr-op": {
    eyebrow: "Purchase order",
    title: "Order 4500002211",
    subtitle: "Alpine Components · EUR 8,640.00",
    status: "Sent",
    groups: [
      {
        title: "Header",
        fields: [
          { label: "Purchase order", value: "4500002211" },
          { label: "Document type", value: "Standard" },
          { label: "Supplier", value: "10300001 · Alpine Components" },
          { label: "Purchasing organization", value: "1010" },
          { label: "Purchasing group", value: "001" },
          { label: "Company code", value: "1010" },
          { label: "Currency", value: "EUR" },
        ],
      },
    ],
    tables: [
      {
        title: "Items",
        columns: ["Item", "Material", "Description", "Quantity", "Unit", "Net price", "Plant"],
        rows: [["10", "RM15", "Raw material 15", "40", "PC", "216.00", "1010"]],
      },
    ],
  },
  "pr-src": {
    eyebrow: "Purchase contract",
    title: "Quantity contract 46000015",
    subtitle: "Call-offs create purchase orders",
    status: "Open",
    groups: [
      {
        title: "Agreement",
        fields: [
          { label: "Contract", value: "46000015" },
          { label: "Contract type", value: "Quantity contract" },
          { label: "Supplier", value: "10300001 · Alpine Components" },
          { label: "Valid from", value: "01 Jan 2026" },
          { label: "Valid to", value: "31 Dec 2026" },
        ],
      },
    ],
    tables: [
      {
        title: "Items",
        columns: ["Item", "Material", "Target quantity", "Released", "Open", "Unit"],
        rows: [["10", "RM15", "2,000", "40", "1,960", "PC"]],
      },
    ],
  },
  "pr-sup": {
    eyebrow: "Business partner",
    title: "Alpine Components",
    subtitle: "Supplier for finance and purchasing",
    groups: [
      {
        title: "Partner",
        fields: [
          { label: "Business partner", value: "10300001" },
          { label: "Name", value: "Alpine Components" },
          { label: "Supplier role", value: "Finance and purchasing" },
        ],
      },
      {
        title: "Company code 1010",
        fields: [
          { label: "Reconciliation account", value: "Trade payables" },
          { label: "Payment terms", value: "30 days net" },
        ],
      },
      {
        title: "Purchasing",
        fields: [
          { label: "Order currency", value: "EUR" },
          { label: "Incoterms", value: "Delivered at place" },
        ],
      },
    ],
  },
  "pr-iv": {
    eyebrow: "Logistics invoice",
    title: "Invoice 5105600123",
    subtitle: "Three-way match against order 4500002211",
    status: "Posted",
    groups: [
      {
        title: "Invoice",
        fields: [
          { label: "Supplier", value: "10300001 · Alpine Components" },
          { label: "Invoice date", value: "18 Mar 2026" },
          { label: "Gross amount", value: "8,640.00 EUR" },
          { label: "Company code", value: "1010" },
        ],
      },
    ],
    tables: [
      {
        title: "Matched items",
        columns: ["Purchase order", "Item", "Ordered", "Received", "Invoiced"],
        rows: [["4500002211", "10", "40 PC", "40 PC", "40 PC"]],
      },
    ],
  },
  "sc-im": {
    eyebrow: "Material document",
    title: "Goods receipt 5000004412",
    subtitle: "Against purchase order 4500002211",
    status: "Posted",
    groups: [
      {
        title: "Document",
        fields: [
          { label: "Material document", value: "5000004412" },
          { label: "Posting date", value: "16 Mar 2026" },
          { label: "Movement", value: "Goods receipt for purchase order" },
        ],
      },
    ],
    tables: [
      {
        title: "Items",
        columns: ["Item", "Material", "Quantity", "Unit", "Plant", "Storage location"],
        rows: [["1", "RM15", "40", "PC", "1010", "101A"]],
      },
    ],
  },
  "sc-ewm": {
    eyebrow: "Warehouse task",
    title: "Putaway task 10000418",
    subtitle: "From the goods receipt area into the bin",
    status: "Open",
    groups: [
      {
        title: "Task",
        fields: [
          { label: "Product", value: "RM15" },
          { label: "Quantity", value: "40 PC" },
          { label: "Source", value: "Goods receipt area" },
          { label: "Destination", value: "Bin A-01-02" },
          { label: "Warehouse", value: "1010" },
        ],
      },
    ],
  },
  "sc-batch": {
    eyebrow: "Batch",
    title: "Batch A260316 of RM15",
    subtitle: "Plant 1010",
    groups: [
      {
        title: "Batch",
        fields: [
          { label: "Material", value: "RM15" },
          { label: "Batch", value: "A260316" },
          { label: "Plant", value: "1010" },
          { label: "Production date", value: "16 Mar 2026" },
          { label: "Shelf-life expiration", value: "16 Mar 2027" },
        ],
      },
    ],
  },
  "rd-bom": {
    eyebrow: "Bill of material",
    title: "Finished good FG100 · plant 1010",
    subtitle: "Usage: production · alternative 1",
    groups: [
      {
        title: "Header",
        fields: [
          { label: "Material", value: "FG100" },
          { label: "Plant", value: "1010" },
          { label: "Usage", value: "Production" },
          { label: "Alternative", value: "1" },
          { label: "Base quantity", value: "1 PC" },
        ],
      },
    ],
    tables: [
      {
        title: "Components",
        columns: ["Item", "Component", "Description", "Quantity", "Unit"],
        rows: [
          ["0010", "RM15", "Raw material 15", "2", "PC"],
          ["0020", "RM16", "Raw material 16", "1", "PC"],
        ],
      },
    ],
  },
  "pp-eng": {
    eyebrow: "Production version",
    title: "Version 0001 of FG100",
    subtitle: "The structure planning is allowed to use",
    groups: [
      {
        title: "Version",
        fields: [
          { label: "Material", value: "FG100" },
          { label: "Plant", value: "1010" },
          { label: "Production version", value: "0001" },
          { label: "Bill of material", value: "Alternative 1" },
          { label: "Routing", value: "Group 50000001 · group counter 1" },
          { label: "Lot size", value: "1 to 9,999 PC" },
        ],
      },
    ],
  },
  "pp-mrp": {
    eyebrow: "Planned order",
    title: "Planned order 300012",
    subtitle: "Proposal from the planning run",
    status: "Open",
    groups: [
      {
        title: "Proposal",
        fields: [
          { label: "Material", value: "FG100" },
          { label: "Plant", value: "1010" },
          { label: "Quantity", value: "50 PC" },
          { label: "Start", value: "06 Apr 2026" },
          { label: "Finish", value: "08 Apr 2026" },
        ],
      },
    ],
  },
  "pp-op": {
    eyebrow: "Production order",
    title: "Order 1000145",
    subtitle: "FG100 · plant 1010",
    status: "Released",
    groups: [
      {
        title: "Order",
        fields: [
          { label: "Order", value: "1000145" },
          { label: "Material", value: "FG100" },
          { label: "Plant", value: "1010" },
          { label: "Order type", value: "Standard production" },
          { label: "Quantity", value: "50 PC" },
          { label: "Start", value: "06 Apr 2026" },
          { label: "Finish", value: "08 Apr 2026" },
        ],
      },
    ],
    tables: [
      {
        title: "Components",
        columns: ["Item", "Component", "Required", "Issued", "Unit"],
        rows: [
          ["0010", "RM15", "100", "0", "PC"],
          ["0020", "RM16", "50", "0", "PC"],
        ],
      },
    ],
  },
  "pp-qm": {
    eyebrow: "Inspection lot",
    title: "Lot 10000004512",
    subtitle: "Goods receipt of RM15",
    status: "Inspection stock",
    groups: [
      {
        title: "Lot",
        fields: [
          { label: "Material", value: "RM15" },
          { label: "Plant", value: "1010" },
          { label: "Lot quantity", value: "40 PC" },
          { label: "Origin", value: "Goods receipt" },
          { label: "Usage decision", value: "Not made" },
        ],
      },
    ],
  },
  "pp-sub": {
    eyebrow: "Purchase order",
    title: "Subcontract order 4500002300",
    subtitle: "Components are provided to the supplier",
    status: "Sent",
    groups: [
      {
        title: "Order",
        fields: [
          { label: "Purchase order", value: "4500002300" },
          { label: "Supplier", value: "10300022 · North Finishers" },
          { label: "Item type", value: "Subcontracting" },
        ],
      },
    ],
    tables: [
      {
        title: "What comes back",
        columns: ["Item", "Material", "Quantity", "Unit", "Plant"],
        rows: [["10", "SF20", "10", "PC", "1010"]],
      },
      {
        title: "Components provided",
        columns: ["Component", "Quantity", "Unit"],
        rows: [
          ["RM15", "20", "PC"],
          ["RM16", "10", "PC"],
        ],
      },
    ],
  },
  "sv-ord": {
    eyebrow: "Service order",
    title: "Service order 80000112",
    subtitle: "On-site repair for the domestic customer",
    status: "In process",
    groups: [
      {
        title: "Order",
        fields: [
          { label: "Sold-to party", value: "10100001 · Domestic customer" },
          { label: "Description", value: "Replace pump seal" },
          { label: "Requested start", value: "02 Apr 2026" },
        ],
      },
    ],
    tables: [
      {
        title: "Items",
        columns: ["Item", "Kind", "Description", "Quantity"],
        rows: [
          ["10", "Labor", "Technician, on site", "3 h"],
          ["20", "Part", "Seal kit", "1 PC"],
        ],
      },
    ],
  },
  "am-req": {
    eyebrow: "Maintenance request",
    title: "Request 10000481",
    subtitle: "Reported from the line",
    status: "Screening",
    groups: [
      {
        title: "Request",
        fields: [
          { label: "Description", value: "Unusual vibration, conveyor 4" },
          { label: "Technical object", value: "Conveyor 4" },
          { label: "Priority", value: "High" },
          { label: "Reported on", value: "29 Mar 2026" },
          { label: "Planning plant", value: "1010" },
        ],
      },
    ],
  },
  "am-pm": {
    eyebrow: "Maintenance order",
    title: "Order 4000122",
    subtitle: "Corrective work · conveyor 4",
    status: "Released",
    groups: [
      {
        title: "Order",
        fields: [
          { label: "Order type", value: "Corrective maintenance" },
          { label: "Description", value: "Replace conveyor bearing" },
          { label: "Technical object", value: "Conveyor 4" },
          { label: "Planning plant", value: "1010" },
          { label: "Basic start", value: "30 Mar 2026" },
        ],
      },
    ],
    tables: [
      {
        title: "Operations and parts",
        columns: ["Operation", "Work", "Component", "Quantity"],
        rows: [["0010", "Replace bearing", "Bearing 6204", "2 PC"]],
      },
    ],
  },
  "hr-core": {
    eyebrow: "Employee",
    title: "Maria Keller",
    subtitle: "Personnel number 100284",
    groups: [
      {
        title: "Person",
        fields: [
          { label: "Personnel number", value: "100284" },
          { label: "Name", value: "Maria Keller" },
          { label: "Company code", value: "1010" },
          { label: "Cost center", value: "101014" },
          { label: "Position", value: "Maintenance technician" },
        ],
      },
    ],
  },
  "hr-time": {
    eyebrow: "Time sheet",
    title: "Week of 23 Mar 2026",
    subtitle: "Maria Keller · 100284",
    groups: [
      {
        title: "Employee",
        fields: [
          { label: "Personnel number", value: "100284" },
          { label: "Name", value: "Maria Keller" },
        ],
      },
    ],
    tables: [
      {
        title: "Entries",
        columns: ["Date", "Hours", "Receiver"],
        rows: [
          ["23 Mar 2026", "7.5", "Cost center 101014"],
          ["24 Mar 2026", "4.0", "Maintenance order 4000122"],
        ],
      },
    ],
  },
  "ps-plan": {
    eyebrow: "Project",
    title: "Line upgrade P-2026-04",
    subtitle: "Company 1010",
    status: "Released",
    groups: [
      {
        title: "Project",
        fields: [
          { label: "Project", value: "P-2026-04" },
          { label: "Description", value: "Packaging line upgrade" },
          { label: "Company code", value: "1010" },
          { label: "Start", value: "01 Apr 2026" },
          { label: "Finish", value: "30 Jun 2026" },
        ],
      },
    ],
    tables: [
      {
        title: "Work breakdown",
        columns: ["Element", "Description", "Start", "Finish"],
        rows: [
          ["P-2026-04-01", "Engineering", "01 Apr 2026", "30 Apr 2026"],
          ["P-2026-04-02", "Installation", "01 May 2026", "15 Jun 2026"],
        ],
      },
    ],
  },
  "ps-fin": {
    eyebrow: "Project cost",
    title: "Installation · P-2026-04-02",
    subtitle: "Actual and plan in the same journal",
    groups: [
      {
        title: "Element",
        fields: [
          { label: "WBS element", value: "P-2026-04-02" },
          { label: "Plan", value: "180,000.00 EUR" },
          { label: "Actual", value: "42,600.00 EUR" },
          { label: "Currency", value: "EUR" },
        ],
      },
    ],
  },
  "ps-log": {
    eyebrow: "Project procurement",
    title: "Purchase for the installation element",
    subtitle: "Account assignment is the project element",
    groups: [
      {
        title: "Assignment",
        fields: [
          { label: "Purchase order", value: "4500002410" },
          { label: "Item", value: "10 · Drive motor" },
          { label: "Charged to", value: "P-2026-04-02 · Installation" },
          { label: "Quantity", value: "2 PC" },
          { label: "Net value", value: "18,400.00 EUR" },
        ],
      },
    ],
  },
  "wc-cr01": {
    eyebrow: "Work center",
    title: "ASSY01 · Assembly",
    subtitle: "Plant 1010 · where a routing operation is performed",
    status: "Active",
    groups: [
      {
        title: "Work center",
        fields: [
          { label: "Work center", value: "ASSY01" },
          { label: "Plant", value: "1010" },
          { label: "Description", value: "Assembly" },
          { label: "Category", value: "Machine" },
        ],
      },
      {
        title: "Costing",
        fields: [
          { label: "Cost center", value: "101014 · Assembly" },
          { label: "Activity", value: "Labor" },
        ],
      },
    ],
  },
  "fl-il01": {
    eyebrow: "Functional location",
    title: "A-01-B · Pump hall",
    subtitle: "The place. Equipment is installed here.",
    status: "Active",
    groups: [
      {
        title: "Location",
        fields: [
          { label: "Functional location", value: "A-01-B" },
          { label: "Description", value: "Pump hall" },
          { label: "Superior location", value: "A-01" },
          { label: "Maintenance plant", value: "1010" },
        ],
      },
    ],
  },
  "eq-ie01": {
    eyebrow: "Equipment",
    title: "10001234 · Circulation pump",
    subtitle: "Installed in functional location A-01-B",
    status: "Installed",
    groups: [
      {
        title: "Equipment",
        fields: [
          { label: "Equipment", value: "10001234" },
          { label: "Description", value: "Circulation pump" },
          { label: "Category", value: "Machine" },
          { label: "Functional location", value: "A-01-B · Pump hall" },
          { label: "Maintenance plant", value: "1010" },
        ],
      },
    ],
  },
  "bp-one": {
    eyebrow: "Business partner",
    title: "10300001 · Alpine Components",
    subtitle: "One partner. Customer and supplier are roles.",
    status: "Active",
    groups: [
      {
        title: "Partner",
        fields: [
          { label: "Business partner", value: "10300001" },
          { label: "Name", value: "Alpine Components" },
          { label: "Grouping", value: "External" },
        ],
      },
      {
        title: "Roles on this partner",
        fields: [
          { label: "Customer", value: "Finance and sales" },
          { label: "Supplier", value: "Finance and purchasing" },
        ],
      },
    ],
  },
  "bp-cust": {
    eyebrow: "Customer role",
    title: "10300001 as a customer",
    subtitle: "Same partner as the supplier role",
    groups: [
      {
        title: "Company code 1010",
        fields: [
          { label: "Reconciliation account", value: "Trade receivables" },
          { label: "Payment terms", value: "14 days net" },
        ],
      },
      {
        title: "Sales area",
        fields: [
          { label: "Sales organization", value: "1010" },
          { label: "Distribution channel", value: "10" },
          { label: "Division", value: "00" },
          { label: "Currency", value: "EUR" },
        ],
      },
    ],
  },
  "ks01": {
    eyebrow: "Cost center",
    title: "101014 · Assembly",
    subtitle: "Company code 1010",
    status: "Active",
    groups: [
      {
        title: "Cost center",
        fields: [
          { label: "Cost center", value: "101014" },
          { label: "Name", value: "Assembly" },
          { label: "Company code", value: "1010" },
          { label: "Responsible", value: "Plant controller" },
        ],
      },
      {
        title: "What assigns to it",
        fields: [
          { label: "Journal line", value: "Can carry this cost center" },
          { label: "Fixed asset", value: "Can be assigned to it" },
          { label: "Work center", value: "ASSY01 posts activity here" },
        ],
      },
    ],
  },
  "sv-prod": {
    eyebrow: "Service product",
    title: "SRV100 · On-site repair",
    subtitle: "Material type Service · base unit H",
    status: "Active",
    groups: [
      {
        title: "Product",
        fields: [
          { label: "Material", value: "SRV100" },
          { label: "Description", value: "On-site technician" },
          { label: "Material type", value: "Service" },
          { label: "Base unit", value: "H" },
        ],
      },
      {
        title: "Plant 1010",
        fields: [
          { label: "Used on", value: "Service order item" },
        ],
      },
    ],
  },
};
