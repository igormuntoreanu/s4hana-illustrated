export const EDITION = {
  product: "SAP S/4HANA on-premise",
  release: "2025 FPS01",
  document: "Feature Scope Description",
  version: "2.0",
  date: "25 February 2026",
  help: "https://help.sap.com/s4hana_op_2025",
} as const;

export type Accent =
  | "finance"
  | "rnd"
  | "procurement"
  | "supply"
  | "manufacturing"
  | "sales"
  | "service"
  | "asset"
  | "hr"
  | "project";

export type Station = {
  id: string;
  title: string;
  area: string;
  body: string;
  system: string[];
  fiori: string;
  appId?: string;
  tcode: string;
  versusEcc?: string;
  fps?: string;
  flag?: string;
};

export type Wing = {
  id: string;
  place: string;
  name: string;
  art: string;
  accent: Accent;
  fsd: string;
  blurb: string;
  stations: Station[];
};

export type Bridge = {
  id: string;
  name: string;
  summary: string;
  wingIds: string[];
  beats: { wingId: string; text: string }[];
};

export const wings: Wing[] = [
  {
    id: "finance",
    place: "The counting house",
    name: "Finance",
    art: "/art/finance.jpg",
    accent: "finance",
    fsd: "Financial Planning and Analysis · Accounting and Financial Close · Treasury Management · Financial Operations · Governance, Risk and Compliance for Finance",
    blurb:
      "Every goods movement, invoice, and confirmation on this campus ends as lines in one journal. Start here.",
    stations: [
      {
        id: "fin-uj",
        title: "Universal Journal",
        area: "Accounting and Financial Close",
        body: "ACDOCA is the single line-item table for the general ledger, controlling, asset accounting, the material ledger, and margin analysis. A business transaction is no longer copied between an FI document and a separate CO document that someone must reconcile at month end. The header still lives in BKPF. Plan values sit beside it in ACDOCP, not in the old totals tables.",
        system: [
          "Table ACDOCA — actual line items; ACDOCP — plan",
          "Leading ledger 0L, plus non-leading ledgers and extension ledgers for parallel accounting",
          "BSEG is still a table: the entry view (posting key, customer or supplier line). New reports read ACDOCA",
          "Compatibility views, not BSEG: BSID, BSIK, BSIS, BSAD, BSAK, BSAS, FAGLFLEXT, GLT0, and the old CO totals COSP and COSS",
        ],
        fiori: "Display Line Items in General Ledger",
        appId: "F2217",
        tcode: "FAGLL03",
        versusEcc:
          "ECC kept FI (BSEG), CO (COEP), asset values, and costing-based CO-PA in separate ledgers. S/4HANA posts them once into ACDOCA. The material ledger is mandatory, so inventory value is a journal line. Display Line Items in General Ledger (F2217) reads ACDOCA. Display Line Item Entry (F2218) still reads the BSEG entry view.",
      },
      {
        id: "fin-gl",
        title: "General Ledger",
        area: "Accounting and Financial Close",
        body: "Manual adjustments are general journal entries. You pick a ledger, a company code, and a document type, and the lines carry account assignment (cost center, profit center, segment, WBS) straight into ACDOCA. Document splitting and parallel ledgers are configuration, not a second product.",
        system: [
          "Document type SA — G/L account document (delivered default; your chart may differ)",
          "Posting key and G/L account on each line",
          "Profitability segments for margin analysis post into the same journal",
        ],
        fiori: "Post General Journal Entries",
        appId: "F0718",
        tcode: "F-02",
        versusEcc:
          "New GL is the only GL. Classic GL, the reconciliation ledger, and most special-purpose ledgers are not the target design. Review posted items in Manage Journal Entries — New Version (F0717A); the older F0717 app is deprecated.",
      },
      {
        id: "fin-ap",
        title: "Accounts payable",
        area: "Financial Operations",
        body: "A supplier is a business partner, not a separate vendor master. FI supplier role FLVN00 holds the company-code view (reconciliation account, payment terms). Supplier role FLVN01 holds purchasing. A logistics invoice matches the purchase order and the goods receipt; a pure FI invoice does not.",
        system: [
          "Logistics invoice document type RE — from MIRO, three-way match, GR/IR clearing",
          "FI supplier invoice document type KR; credit memo KG; payment KZ",
          "Automatic payment program clears open items and posts the payment document",
        ],
        fiori: "Manage Supplier Invoices",
        appId: "F0859",
        tcode: "MIRO · FB60 · F110",
        versusEcc:
          "XK01 is not the strategic way to create a supplier. Maintain the business partner (transaction BP). Open items: Manage Supplier Line Items (F0712). Payments: Manage Automatic Payments (F0770) or F110.",
      },
      {
        id: "fin-ar",
        title: "Accounts receivable",
        area: "Financial Operations",
        body: "A customer is the same business partner idea: FI customer role FLCU00 and customer role FLCU01. Billing in Sales creates the FI document; you do not retype it. Incoming payments clear those open items. Credit is SAP Credit Management on the business partner, not the old FD32 credit master.",
        system: [
          "Customer invoice document type DR; credit memo DG; incoming payment DZ",
          "SD billing posts accounting document type RV into ACDOCA",
          "Credit master is the business partner credit profile (UKM), role UKM000",
          "Post Incoming Payments (F1345) clears one payment against open items, including residual items with a reason code",
        ],
        fiori: "Post Incoming Payments",
        appId: "F1345",
        tcode: "F-28 · FB70 · BP",
        versusEcc:
          "In ECC a customer was a separate master (XD01) and credit often lived on the old credit master (FD32). In S/4HANA the customer is a business partner, and one partner can be both customer and supplier. Billing creates the finance document; you do not retype it. Incoming payments clear those open items. Credit is SAP Credit Management on the business partner.",
      },
      {
        id: "fin-aa",
        title: "Asset accounting",
        area: "Accounting and Financial Close",
        body: "New Asset Accounting is the only asset accounting. Acquisitions, retirements, and depreciation are Universal Journal lines with asset fields filled in — there is no separate asset ledger to reconcile to the GL. A valuated goods receipt against an asset purchase order already capitalizes; a non-integrated acquisition is a dedicated posting.",
        system: [
          "Depreciation run posts with FAA_DEPRECIATION_POST (classic transaction AFAB schedules it)",
          "Asset master stays in ANLA. Old value tables ANEP, ANLC, ANLP, and ANEA are compatibility views over ACDOCA",
          "Settlement of an asset under construction from an investment project or a WBS",
        ],
        fiori: "Manage Fixed Assets",
        appId: "F3425",
        tcode: "AS01 · AFAB · ABZON",
        versusEcc:
          "Classic Asset Accounting (the old reconciliation accounts and periodic posting to GL) cannot be used. Depreciation areas follow the ledger approach.",
        flag: "Manage Fixed Assets is F3425. Cloud Public Edition 2608 deprecates that tile in favor of F3425A. On 2025 on-premise, check which tile your Fiori catalog actually assigned before you print the ID.",
      },
      {
        id: "fin-fpa",
        title: "Financial planning and analysis",
        area: "Financial Planning and Analysis",
        body: "Actual margin analysis is account-based and already in ACDOCA: revenue, cost of goods sold, and contribution by market segment. Plans are stored in ACDOCP and compared with actuals in the same analytical apps. Cost-center planning and P&L actuals are core. A full planning story often adds SAP Analytics Cloud, which is a separate product, not a transaction inside the ABAP stack.",
        system: [
          "ACDOCP plan line items, matched to ACDOCA actuals",
          "Margin analysis — strategic profitability; costing-based CO-PA is not the single source of truth",
          "Apps you will meet: Import Financial Plan Data, Cost Centers — Plan/Actual, P&L — Actuals",
        ],
        fiori: "Import Financial Plan Data",
        tcode: "KP06 is legacy cost-center planning — prefer ACDOCP",
        versusEcc:
          "ECC profitability was often a costing-based CO-PA operating concern, transferred rather than posted. In S/4HANA the account-based market segment is a real posting in the Universal Journal.",
      },
      {
        id: "fin-tr",
        title: "Treasury and cash",
        area: "Treasury Management",
        body: "Bank Account Management is the master of house banks and bank accounts. Cash position and liquidity forecast read One Exposure from Operations (table FQM_FLOW), which collects forecasted and actual cash from invoices, payments, and treasury deals. Treasury and Risk Management covers money-market, foreign-exchange, and securities deals on top of that cash view.",
        system: [
          "Bank account master in Bank Account Management, not only FI12",
          "One Exposure table FQM_FLOW feeds the cash apps",
          "Deal capture classic transaction FTR_CREATE; bank communication sits beside the payment run",
        ],
        fiori: "Manage Bank Accounts · Cash Flow Analyzer",
        tcode: "FTR_CREATE · FI12",
        flag: "Advanced treasury instruments and some trading functions are license-sensitive. The Feature Scope Description lists Treasury Management as its own Finance chapter — confirm which instruments your contract includes.",
      },
      {
        id: "fin-grc",
        title: "GRC for finance",
        area: "Governance, Risk and Compliance for Finance",
        body: "In the Feature Scope Description this chapter is about trade compliance and the financial risk of shipping the wrong thing to the wrong partner: reviewing business partners, foreign-trade rules, embargoes, and legal control so goods clear and fines are avoided. It is not the separate SAP Access Control or Process Control suite. Statutory returns themselves are run as advanced compliance reports under accounting close.",
        system: [
          "International trade checks against the business partner and the document",
          "Run Statutory Reports for periodic legal output (advanced compliance reporting)",
          "Classification and legal control sit on the material and the country pair",
        ],
        fiori: "Manage International Trade Classification",
        tcode: "Confirm in your trade configuration — there is no single ‘GRC’ transaction",
        flag: "SAP Help describes this chapter as foreign-trade compliance (trading partners, regulations, clearance), not enterprise GRC access governance. App names differ by scope; confirm yours in the 2025 Fiori library. Do not teach SAP Access Control as if it shipped inside this chapter.",
      },
    ],
  },
  {
    id: "rnd",
    place: "The atelier",
    name: "Research and development (R&D) and engineering",
    art: "/art/rnd.jpg",
    accent: "rnd",
    fsd: "Product structure, change control, and product compliance inside Enterprise Management. Confirm the exact 2025 chapter headings in the Feature Scope Description when you map licenses.",
    blurb:
      "The product master comes first. Nothing should be planned or procured until that material has a bill of material and a change record the plant is allowed to build.",
    stations: [
      {
        id: "rd-mat",
        title: "Material master",
        area: "Product master",
        body: "A material is the product you buy, make, store, and sell. The material type decides which views exist. Basic data is shared across the company. Plant data holds planning and procurement. Sales data holds the sales area. Valuation holds the price and the valuation class. Because the material ledger is always on, a valuated stock movement posts inventory value as a journal line.",
        system: [
          "Material type — raw material, semi-finished, finished good, or trading good",
          "Views — basic data, purchasing, sales, MRP, accounting, and storage",
          "MM01 create · MM02 change",
        ],
        fiori: "Manage Product Master Data",
        appId: "F1602",
        tcode: "MM01 · MM02",
        versusEcc:
          "You still create a material, and MM01 is still that transaction. What changed is around it. The usual place to maintain the product is Manage Product Master Data. The material ledger is mandatory, so a valuated material is not held at a statistical price outside the journal. The same material carries the views the other buildings use: purchasing, sales, planning, and valuation. It is not a business partner.",
      },
      {
        id: "rd-plm",
        title: "Change control",
        area: "Product lifecycle",
        body: "A released product structure is changed on purpose. The newer object is the change record, processed in Fiori, with a status that tells planning and production whether the new structure is released. The classic engineering change master still exists for plants that have not moved. Drawings and specifications are document info records, linked to the material — not files dropped on a share.",
        system: [
          "Change record — strategic change object in current releases",
          "Classic ECM change master — transaction CC01",
          "Document info record — CV01N, or Manage Documents",
        ],
        fiori: "Manage Change Records",
        tcode: "CC01 · CV01N",
        versusEcc:
          "ECC lived on the change master (AENNR) alone. S/4HANA adds the change record as the object that can carry impact analysis and a release decision into manufacturing.",
        flag: "Confirm the Manage Change Records app ID for 2025 FPS01 in the Fiori library. Portfolio-level research and development (R&D) projects are a different object — see the Project System wing.",
      },
      {
        id: "rd-bom",
        title: "Bill of material",
        area: "Product structure",
        body: "A material BOM lists components, quantities, and validity. Usage separates an engineering structure from the one MRP and costing are allowed to explode. MRP Live will not choose a BOM by guesswork: a production version must point at one BOM alternative and one routing. That production version is mandatory for planning in S/4HANA.",
        system: [
          "CS01 — create material BOM",
          "BOM usage 1 production, 2 engineering, 3 universal (delivered defaults)",
          "Production version — C223 or Manage Production Versions — ties BOM + routing",
        ],
        fiori: "Maintain Bill of Material",
        tcode: "CS01 · CS02 · C223",
        versusEcc:
          "ECC MRP could select a BOM without a production version. In S/4HANA the production version is how MRP, costing, and shop-floor execution agree on the structure.",
      },
      {
        id: "rd-comp",
        title: "Product compliance",
        area: "Product compliance",
        body: "Compliance data answers whether this product may be sold or shipped into a market, and whether a delivery is dangerous goods. Checks can stop an outbound delivery. Safety data sheets and marketability are master data, not a note on the sales order.",
        system: [
          "Product marketability and dangerous-goods data on the product",
          "Checks can block a delivery or a sales document",
          "Often licensed as SAP S/4HANA for product compliance, not assumed in every core install",
        ],
        fiori: "Manage Product Compliance",
        tcode: "Use the compliance Fiori apps — there is no single classic transaction",
        flag: "Product compliance is real on-premise functionality, and it is often a separate license. The 2025 Feature Scope Description is the list that wins over a generic ‘PLM includes EH&S’ slide. Do not mix in Cloud Public Edition scope-item IDs.",
      },
    ],
  },
  {
    id: "procurement",
    place: "The market hall",
    name: "Sourcing and procurement",
    art: "/art/procurement.jpg",
    accent: "procurement",
    fsd: "Procurement Analytics · Sourcing and Contract Management · Operational Procurement · Invoice Management · Supplier Management",
    blurb:
      "Demand becomes a purchase requisition, a source of supply, a purchase order, and later an invoice. The supplier is a business partner.",
    stations: [
      {
        id: "pr-op",
        title: "Operational purchasing",
        area: "Operational Procurement",
        body: "A purchase requisition is the internal request. Source determination looks at outline agreements, info records, and source lists, then a purchase order is sent to the supplier. Self-service requisitioning lets a requester order from a catalog without calling a buyer for every pen.",
        system: [
          "Requisition document type NB is the usual delivered default",
          "Purchase order type NB standard; UB stock transport; item category blank for normal, L for subcontracting",
          "Account assignment on the PR or PO when the cost hits a cost center, project, or asset",
        ],
        fiori: "Manage Purchase Orders",
        appId: "F0842A",
        tcode: "ME51N · ME21N",
        versusEcc:
          "The document chain PR → PO is familiar. What changed is the supplier master (business partner) and the fact that the later invoice and goods receipt post into ACDOCA, not a side ledger.",
        flag: "Manage Purchase Requisitions is a current Fiori app; confirm its app ID (often cited as F1048) against the 2025 library before printing it.",
      },
      {
        id: "pr-src",
        title: "Sourcing and contracts",
        area: "Sourcing and Contract Management",
        body: "A contract is a long-running agreement you release against. A quantity contract limits how many you may call off; a value contract limits how much. The info record stores the price and conditions for one material and one supplier. A request for quotation is how you collect those prices before you award.",
        system: [
          "Contract type MK quantity, WK value (delivered defaults)",
          "Purchasing info record — ME11",
          "Source list and quota arrangement decide who gets the next requisition",
        ],
        fiori: "Manage Purchase Contracts",
        tcode: "ME31K · ME11 · ME41",
        versusEcc:
          "Quantity contracts, value contracts, info records, and requests for quotation are the same sourcing tools as in ECC. A call-off still creates a purchase order that consumes the open quantity or value. The supplier on the agreement is a business partner, not a vendor master created with XK01.",
        flag: "Confirm the Manage Purchase Contracts app ID for 2025 FPS01. ME31K remains the classic create transaction.",
      },
      {
        id: "pr-sup",
        title: "Supplier management",
        area: "Supplier Management",
        body: "Create one business partner and assign the supplier roles. Purchasing data (order currency, incoterms, partner functions) hangs off FLVN01. Evaluation scores can use quality results from inspection lots, not a spreadsheet beside the system. A supplier can also be a customer — same partner, extra roles.",
        system: [
          "Transaction BP — roles FLVN00 (FI supplier) and FLVN01 (supplier)",
          "Purchasing organization data on the supplier role",
          "Supplier evaluation can read QM scores",
        ],
        fiori: "Manage Business Partner Master Data",
        tcode: "BP",
        versusEcc:
          "Vendor master XK01 / MK01 and customer master XD01 are replaced by the business partner and customer/vendor integration. Do not design a new process on XK01.",
      },
      {
        id: "pr-iv",
        title: "Invoice management",
        area: "Invoice Management",
        body: "The supplier invoice that refers to a purchase order is parked or posted in logistics invoice verification. A three-way match compares purchase-order price, goods-receipt quantity, and invoice amount. Differences within tolerance post; differences outside it block. The GR/IR clearing account is the hinge between the receipt and the invoice, and both sides are Universal Journal lines.",
        system: [
          "MIRO posts document type RE",
          "GR/IR account clears when quantities match",
          "Blocked invoices are released after the discrepancy is resolved",
        ],
        fiori: "Manage Supplier Invoices",
        appId: "F0859",
        tcode: "MIRO · MIR7",
        versusEcc:
          "The match itself is the same idea as ECC. The financial document is an ACDOCA posting, and the supplier is a business partner.",
      },
      {
        id: "pr-ext",
        title: "What ‘extended procurement’ is not",
        area: "Scope boundary",
        body: "The 2025 on-premise Feature Scope Description does not have a chapter called Extended Procurement. People use that phrase for three different things: Central Procurement (a hub, often separately licensed), the SAP Business Network / Ariba connection, or the old SRM extended-classic scenario. SRM is not S/4HANA. Teach Operational Procurement, Sourcing and Contract Management, Supplier Management, Invoice Management, and Procurement Analytics as the chapters that are actually in the book.",
        system: [
          "Core chain stays PR → source → PO → goods receipt → MIRO → F110",
          "Central Procurement and Business Network are additional, not renamed operational purchasing",
          "Do not import S/4HANA Cloud Public Edition scope-item IDs onto an on-premise slide",
        ],
        fiori: "No single app — this station is a scope check",
        tcode: "—",
        flag: "If a license list in front of you includes Central Procurement, teach it as an extra hub scenario with its own Feature Scope notes, not as a synonym for ME21N.",
      },
    ],
  },
  {
    id: "supply",
    place: "The yard",
    name: "Supply chain",
    art: "/art/supply.jpg",
    accent: "supply",
    fsd: "Inventory · Delivery and Transportation · Warehousing · Order Promising",
    blurb:
      "Stock, bins, trucks, batches, and the promise you make on a sales order. Classic WM is not the warehouse you design anymore.",
    stations: [
      {
        id: "sc-im",
        title: "Inventory management",
        area: "Inventory",
        body: "A goods movement posts a material document and, when the movement is valuated, a Universal Journal document in the same step. The material ledger is always on, so inventory value is not a periodic afterthought. Physical inventory is a count document, a count, and a posting of differences — not a spreadsheet adjustment.",
        system: [
          "MIGO — movement 101 goods receipt, 261 issue to a production order, 601 issue for a delivery",
          "Stock types: unrestricted, quality inspection, blocked",
          "Physical inventory — MI01 count document, MI04 enter count, MI07 post difference",
          "MATDOC stores the document. MKPF and MSEG are compatibility proxies. Stock quantity is calculated from MATDOC, not stored as a balance in MARD",
        ],
        fiori: "Manage Stock · Post Goods Movement",
        tcode: "MIGO · MI01",
        versusEcc:
          "ECC could run inventory without the material ledger. S/4HANA cannot. Valuated stock changes are ACDOCA lines.",
        flag: "Confirm current Fiori app IDs for Post Goods Movement and physical inventory in the 2025 library. MIGO and the MI0* transactions are the stable names.",
      },
      {
        id: "sc-ewm",
        title: "Embedded EWM",
        area: "Warehousing",
        body: "Embedded Extended Warehouse Management runs in the same S/4HANA system. An inbound delivery becomes warehouse tasks (putaway); an outbound delivery order becomes pick tasks. The warehouse monitor is the place you see bins, tasks, and queues. Basic warehousing and advanced warehousing are not the same license.",
        system: [
          "Inbound delivery /SCWM/PRDI — warehouse tasks for putaway",
          "Outbound /SCWM/PRDO — picking and staging",
          "Monitor /SCWM/MON",
          "Released ABAP APIs: /SCWM/IF_API_WHSE_ORDER and /SCWM/IF_API_WHSE_TASK. OData: API_WAREHOUSE_ORDER_TASK_2",
        ],
        fiori: "Process Warehouse Tasks · Run Outbound Process",
        tcode: "/SCWM/MON · /SCWM/PRDI · /SCWM/PRDO",
        versusEcc:
          "Classic LE-WM is not the warehouse you design on S/4HANA. It lived in the compatibility pack; do not start a new warehouse on it. Stock Room Management remains only as a restricted simple-warehouse option. Embedded EWM replaces WM.",
        flag: "Basic embedded EWM and advanced EWM (labor management, waves, value-added services, and similar) split by license. Some FPS01 notes describe Joule in warehouse apps for Cloud ERP Private — on a pure on-premise stack, Joule needs SAP BTP connectivity. Do not assume it installed with the ABAP system.",
      },
      {
        id: "sc-tm",
        title: "Transportation management",
        area: "Delivery and Transportation",
        body: "Embedded TM plans how a delivery actually moves. Freight units are the demand (often built from outbound deliveries). A freight order is the truck, the carrier, and the stages. The transportation cockpit is where a planner assigns units to orders. Shipping in Sales without TM is only the delivery; TM is the transportation document.",
        system: [
          "Freight unit from an outbound delivery",
          "Freight order — carrier, stages, charges",
          "Charge calculation and settlement feed Finance when you use them",
        ],
        fiori: "Create Freight Orders · Transportation Cockpit",
        tcode: "Use the TM Fiori apps and the transportation cockpit",
        flag: "Basic shipping versus advanced TM (planning optimizer, charge management, and similar) is a license split. Confirm which one the 2025 Feature Scope Description marks as core Enterprise Management for your contract.",
      },
      {
        id: "sc-batch",
        title: "Batch management",
        area: "Inventory",
        body: "A batch is a quantity of one material that shares characteristics: expiry, production date, potency, country of origin. You create it at goods receipt or earlier, and batch determination proposes which batch to pick on a delivery, a production order, or a process order. It is master data plus a search strategy, not a warehouse name.",
        system: [
          "Batch master — MSC1N create, MSC2N change, MSC3N display",
          "Classification characteristics on the batch class",
          "Batch determination strategy in SD, PP, and MM",
        ],
        fiori: "Manage Batches",
        tcode: "MSC1N · MSC2N",
        flag: "Confirm the Manage Batches app ID for 2025 FPS01. Where-used and batch derivation depend on industry configuration — do not promise derivation unless the batch where-used records are active.",
      },
      {
        id: "sc-atp",
        title: "Order promising (aATP)",
        area: "Order Promising",
        body: "Advanced ATP is how S/4HANA confirms a sales order. The product availability check looks at stock and future receipts. Around it sit product allocation, supply protection, backorder processing, and alternative-based confirmation. A simple check still exists; the strategic name in the supply-chain chapter is Order Promising.",
        system: [
          "Product availability check during sales-order scheduling",
          "Backorder processing re-confirms when supply changes",
          "Classic review of the check — CO09 — still explains a confirmation",
        ],
        fiori: "Configure Product Allocation · Release for Delivery",
        tcode: "CO09 for the availability overview",
        versusEcc:
          "ECC ATP was the check inside the sales order (CO09). S/4HANA aATP adds allocation, protection, and backorder processing as first-class supply-chain functions, some of them licensed separately from a basic check.",
        fps: "2025 FPS01 What’s New notes, shared by on-premise and Cloud Private Edition, describe cut-off times on the product availability check so a receipt planned after a time of day counts as the next day. Confirm the note in the What’s New viewer before you treat the cut-off as already configured.",
        flag: "Product allocation, supply protection, and alternative-based confirmation are advanced ATP scope. Do not describe them as free with every core install, and do not use Cloud Public Edition scope-item codes.",
      },
    ],
  },
  {
    id: "manufacturing",
    place: "The works",
    name: "Manufacturing",
    art: "/art/manufacturing.jpg",
    accent: "manufacturing",
    fsd: "Just-In-Time Processing · Production Engineering · Production Planning · Production Operations · Quality Management",
    blurb:
      "A production version, an MRP Live run, an order, a confirmation. Components stage in the warehouse; yield and scrap hit the journal.",
    stations: [
      {
        id: "pp-eng",
        title: "Production engineering",
        area: "Production Engineering",
        body: "The plant builds what engineering released, but only through a production version: one BOM alternative, one routing, one lot-size range. The routing holds operations and work centers. Work centers carry the available capacity MRP and scheduling use. Without that version, MRP Live has nothing lawful to explode.",
        system: [
          "Work center — CR01",
          "Routing — CA01",
          "Production version — C223, required for MRP in S/4HANA",
        ],
        fiori: "Manage Production Versions · Manage Routings",
        tcode: "C223 · CA01 · CR01",
        versusEcc:
          "ECC allowed BOM selection by usage and alternative alone. S/4HANA planning selects a production version.",
      },
      {
        id: "pp-mrp",
        title: "MRP Live",
        area: "Production Planning",
        body: "MRP Live (MD01N) plans in SAP HANA and writes planned orders and purchase requisitions. The stock/requirements list is where a planner reads shortages. Materials MRP Live cannot plan fall back to classic MRP — you see that in the MRP log, you do not pretend every material ran in HANA. Demand can come from sales orders, planned independent requirements, or dependent requirements exploded from a parent BOM.",
        system: [
          "MD01N — MRP Live",
          "MD04 — stock/requirements list, Fiori Manage Material Coverage (F0251A)",
          "Planned order is the proposal; it is not yet a production order",
        ],
        fiori: "Manage Material Coverage",
        appId: "F0251A",
        tcode: "MD01N · MD04",
        versusEcc:
          "Classic MRP (MD01) reads the database row by row. MRP Live is the strategic run. A few functions still force a classic fallback — check the log rather than disabling MRP Live.",
      },
      {
        id: "pp-op",
        title: "Production operations",
        area: "Production Operations",
        body: "Converting a planned order creates a production order (delivered type PP01) or, in process industries, a process order. Release allows staging and confirmation. Goods issue of components is movement 261. Goods receipt of the finished material is movement 101. Confirmation posts yield, scrap, and activities. Costs and the later settlement or event-based variance post into ACDOCA.",
        system: [
          "Production order type PP01 — CO01 create, CO02 change",
          "Confirmation — CO11N operation, or CO15 for the order",
          "Movements 261 issue and 101 receipt",
        ],
        fiori: "Manage Production Orders",
        appId: "F2336",
        tcode: "CO01 · CO02 · CO11N",
        versusEcc:
          "The order itself looks familiar. Costing no longer waits for a separate CO document: material issues and receipts are journal lines. Event-based production costing can post WIP and variances at the time of the goods receipt instead of only at period-end settlement (KO88).",
        flag: "Manage Production Operations is F2335. Whether event-based order costing is active is configuration — do not tell every plant that KO88 has disappeared.",
      },
      {
        id: "pp-jit",
        title: "Just-in-time",
        area: "Just-In-Time Processing",
        body: "JIT, in the manufacturing chapter, is sequenced supply to a production line — typical in automotive — not a slogan for ‘low stock’. A control cycle defines who sends what to which supply area. JIT calls, and summarized JIT calls, pull that material. Do not confuse it with Kanban, which is a separate replenishment technique (classic transaction PK13N).",
        system: [
          "Control cycle defines the demand source and the supply source",
          "JIT call and summarized JIT call are the demand documents",
          "Kanban control cycles are a different process — PK13N",
        ],
        fiori: "Manage JIT Calls",
        tcode: "Use the JIT Fiori apps rather than a guessed transaction",
        flag: "The 2025 Feature Scope Description lists Just-In-Time Processing as its own manufacturing section, ahead of Production Engineering. Confirm app IDs in the Fiori library. Industry content (automotive JIS) may be a further license.",
      },
      {
        id: "pp-qm",
        title: "Quality management",
        area: "Quality Management",
        body: "An active inspection type on the material creates an inspection lot at the triggering event. Results are recorded against characteristics. The usage decision accepts, rejects, or moves the stock. In inventory management, the quantity waits in quality stock until that decision. This is also the gate on a production receipt and on a customer return.",
        system: [
          "Inspection type 01 — goods receipt for a purchase order",
          "Type 03 — in-process for a production order; type 04 — goods receipt from production",
          "Record results QE51N; usage decision QA11",
        ],
        fiori: "Manage Inspection Lots · Manage Usage Decisions",
        tcode: "QA01 · QE51N · QA11",
        flag: "Projects copy inspection types to their own keys (01xx). Confirm the key on the material master QM view. Inside embedded EWM the inspection is integrated with warehouse tasks and a quality bin — do not teach the inventory-management lot as if it bypassed EWM.",
      },
      {
        id: "pp-sub",
        title: "Outsourced manufacturing",
        area: "Production Operations with purchasing",
        body: "Subcontracting is a purchase order with item category L. You provide components to the supplier (movement 541, special stock at vendor). The goods receipt of the finished material (101) consumes those components (movement 543 booked automatically). The supplier invoice is still MIRO. The Feature Scope Description does not title a separate ‘Outsourced Manufacturing’ chapter; this is the on-premise process that chapter name usually means.",
        system: [
          "PO item category L",
          "Movement 541 to stock provided to vendor; 543 consumption at goods receipt",
          "Invoice document type RE against that PO",
        ],
        fiori: "Manage Purchase Orders",
        appId: "F0842A",
        tcode: "ME21N · MIGO · MIRO",
        flag: "Some countries add a subcontracting challan or a tax document on the component shipment. That is localization, not the core item category. Do not describe Cloud Public ‘scope item BMY’ as the on-premise name.",
      },
    ],
  },
  {
    id: "sales",
    place: "The storefront",
    name: "Sales",
    art: "/art/sales.jpg",
    accent: "sales",
    fsd: "Sales orders, contracts, pricing, billing, and event-based revenue recognition. Revenue recognition itself is posted from Accounting and Financial Close (CO-PC-OBJ-EBR).",
    blurb:
      "An order promises a date, pricing finds a price, the delivery leaves the yard, and billing writes the journal.",
    stations: [
      {
        id: "sd-so",
        title: "Sales order management",
        area: "Order management",
        body: "A standard order (delivered type OR) is the demand. The item category (TAN for a normal stock item) decides if it is relevant for delivery and billing. The schedule line carries the confirmed quantity and the date from the availability check. The sold-to party is a business partner with customer roles, not an XD01 master.",
        system: [
          "Document type OR — standard order; QT quotation",
          "Item category TAN — standard item",
          "Schedule line drives requirements and the later delivery",
        ],
        fiori: "Manage Sales Orders",
        appId: "F1873",
        tcode: "VA01 · VA02",
        versusEcc:
          "The document shape is the one you already know from ECC: a document type, an item category, and a schedule line that carries the confirmed quantity and date. The parties are different. Sold-to, ship-to, and bill-to are roles of a business partner, not a customer master created with XD01. Overall processing, delivery, and billing status used to live in separate status records beside the order; in S/4HANA they belong to the order itself, so you read them with the document. The availability check can be advanced ATP — allocation, supply protection, and backorder processing — rather than only the classic check. Credit is SAP Credit Management on the business partner, not the old FD32 credit master.",
      },
      {
        id: "sd-pr",
        title: "Pricing",
        area: "Price management",
        body: "Pricing is the condition technique. A pricing procedure (delivered RVAA01 is the usual starting point) lists condition types such as PR00 for the base price. Access sequences find a condition record by customer, material, or price list. Determination uses sales area, the document pricing procedure, and the customer pricing procedure. You maintain records; you do not type the price onto the order unless the procedure allows it.",
        system: [
          "Condition type PR00 — price",
          "VK11 create condition records; VK12 change",
          "Procedure RVAA01 is the delivered baseline, almost always copied",
        ],
        fiori: "Manage Prices — Sales",
        tcode: "VK11 · VK12",
        versusEcc:
          "The condition technique is the same idea as in ECC: a pricing procedure, condition types such as the base price, and condition records for a customer, a material, or a price list. In ECC the calculated price was stored beside the order. In S/4HANA it is part of the sales document, so the price on the order is the price that posts. The customer used in pricing is a business partner.",
        flag: "Confirm the Manage Prices — Sales app ID for 2025 FPS01. Procedure and condition-type names are configuration; PR00 and RVAA01 are the delivered examples to teach, not a promise about a given client.",
      },
      {
        id: "sd-bil",
        title: "Billing",
        area: "Billing",
        body: "A delivery-related invoice uses billing type F2 and refers to the outbound delivery after goods issue. The billing document creates an accounting document (type RV) in the Universal Journal — revenue, tax, and the customer line — without a second manual FI invoice. Credit memos use billing type G2. The document flow on the order is the audit trail.",
        system: [
          "Billing type F2 invoice; G2 credit memo",
          "VF01 create; VF02 change; VF11 cancel",
          "Accounting document type RV posts into ACDOCA",
        ],
        fiori: "Create Billing Documents · Manage Billing Documents",
        tcode: "VF01 · VF02",
        versusEcc:
          "A delivery-related invoice and a credit memo are the same business documents as in ECC. The invoice creates accounting lines in the Universal Journal directly; you do not type a second customer invoice in finance. Header status sits on the billing document. Billing items do not keep a separate status record the way they did in ECC.",
        flag: "Confirm Fiori app IDs for 2025 FPS01 (Manage Billing Documents has carried F0797 for a long time — recheck before you publish a poster).",
      },
      {
        id: "sd-con",
        title: "Sales contracts",
        area: "Contract management",
        body: "A quantity contract (type CQ) caps how much the customer may release. A value contract (type WK1) caps the value. Call-offs are sales orders created with reference, and they consume the open quantity or value. The contract itself is not a delivery. Pricing can live on the contract and copy to the release order.",
        system: [
          "CQ — quantity contract; WK1 — value contract (delivered types)",
          "Release order with reference, document flow back to the contract",
          "Incomplete contracts show up before anyone promises a delivery",
        ],
        fiori: "Manage Sales Contracts",
        tcode: "VA41 · VA42",
        versusEcc:
          "A quantity contract and a value contract work as they did in ECC. A release order, which is a sales order with reference, consumes the open quantity or the open value. The contract itself is not delivered. The customer on the contract is a business partner, and the release order follows the same status and pricing rules as any other sales order.",
        flag: "Confirm the Manage Sales Contracts app ID for 2025 FPS01. WK2 exists as a material-related value contract in many clients.",
      },
      {
        id: "sd-ebrr",
        title: "Revenue recognition",
        area: "Accounting and Financial Close",
        body: "Event-based revenue recognition posts accruals and deferrals into ACDOCA when the business event happens — goods issue, invoice, or a period-end completion — instead of waiting for a classic results-analysis run to invent them. Sell-from-stock often recognizes at goods issue. Milestone and period billing need an explicit method.",
        system: [
          "Component CO-PC-OBJ-EBR",
          "Sell-from-stock uses the sales order item as the account assignment. The recognition key decides the method. Postings are ACDOCA lines",
          "Apps: Event-Based Revenue Recognition — Sales Orders (Version 2), and the period-end run Run Revenue Recognition — Sales Orders",
        ],
        fiori: "Event-Based Revenue Recognition — Sales Orders",
        tcode: "Monitored in the EBRR apps rather than a single classic code",
        versusEcc:
          "ECC results analysis (KKA*) calculated revenue in CO at period end. EBRR writes the Universal Journal as events occur. Some scenarios still use classic results analysis — check the recognition key before you declare KKA* gone.",
        fps: "From 2025 FPS01 (also 2023 SPS05), completed-contract method 9 is supported for sales items with billing relevance I (order-related billing, billing plan). Delivered item categories called out in What’s New: CBAO milestone billing plan, DB1 third-party with shipping notification and milestone plan, DB2 third-party without shipping notification. Availability is on-premise S/4HANA and Cloud Private Edition — not a Public Edition-only feature.",
      },
    ],
  },
  {
    id: "service",
    place: "The service yard",
    name: "Service",
    art: "/art/service.jpg",
    accent: "service",
    fsd: "Service Master Data and Agreement Management · Service Operations and Processes",
    blurb:
      "S/4HANA Service orders, in-house repair, and agreements. The dispatch board most people call field service is a different product.",
    stations: [
      {
        id: "sv-ord",
        title: "Service order management",
        area: "Service Operations and Processes",
        body: "A service order in S/4HANA Service is its own document: items for labor, parts, and expenses, confirmation of what was performed, then billing. It is not a plant-maintenance order with a different label, and it is not the older Customer Service order that shared the PM order engine. Confirmations post costs; billing posts revenue into the Universal Journal. Event-based revenue recognition can follow the service document.",
        system: [
          "Service order and service confirmation are separate documents",
          "Parts can create a reservation or a procurement need",
          "Billing integrates to ACDOCA; EBRR is component CO-PC-OBJ-EBR",
        ],
        fiori: "Manage Service Orders",
        tcode: "Run this process in the service Fiori apps",
        versusEcc:
          "Classic CS (service notifications and CS orders on the PM engine) is the compatibility-era process. New designs use S/4HANA Service.",
        fps: "2025 What’s New for on-premise and private edition extends EBRR on service documents (including cost-based percentage of completion and completed contract, depending on billing relevance). Read the service revenue note before treating one method as the only one.",
        flag: "Confirm Manage Service Orders app ID for 2025 FPS01. There is often no VA01-style transaction for the new service order — do not invent one.",
      },
      {
        id: "sv-ih",
        title: "In-house repair",
        area: "Service Operations and Processes",
        body: "In-house repair is the returns-and-bench process: a repair object comes back, a pre-check decides warranty, diagnosis and repair happen in the plant, then the object is shipped out. It is structured as its own repair order, not as a free-text sales return. Billing of the chargeable repair closes to Finance.",
        system: [
          "In-house repair order with a repair object",
          "Pre-check, diagnosis, repair, outbound shipment",
          "Chargeable items bill; warranty items should not quietly become revenue",
        ],
        fiori: "Manage In-House Repairs",
        tcode: "Use the in-house repair Fiori apps",
        flag: "Confirm the app ID in the 2025 Fiori library. Do not model this as a sales return (order type RE) plus a production order unless the project has deliberately designed that workaround.",
      },
      {
        id: "sv-fsm",
        title: "Field service — the boundary",
        area: "Scope boundary",
        body: "The on-premise Feature Scope Description chapters are agreements and service operations, including service orders and in-house repair. SAP Field Service Management — the scheduling and mobile dispatch product — is a separate cloud application. Many customers integrate it to S/4HANA Service. It is not installed by the on-premise FPS, and it is not an S/4HANA Cloud Public Edition scope item you can turn on in this system.",
        system: [
          "On-premise: service order, confirmation, contract, in-house repair",
          "Planning board and technician mobile app: SAP Field Service Management, integrated",
          "Agreements live under Service Master Data and Agreement Management",
        ],
        fiori: "Manage Service Contracts for the on-premise agreement",
        tcode: "—",
        flag: "If a landscape diagram shows FSM, label it as a cloud product beside S/4HANA, not as a transaction inside FPS01.",
      },
    ],
  },
  {
    id: "asset",
    place: "The workshop",
    name: "Asset management",
    art: "/art/asset.jpg",
    accent: "asset",
    fsd: "Maintenance Management. Plant Maintenance is the application component (PM) under that chapter. Environment, Health, and Safety sits beside it — confirm the license in the Feature Scope Description.",
    blurb:
      "A technical object fails or comes due, a request becomes an order, parts are consumed, and the cost lands on the asset’s company.",
    stations: [
      {
        id: "am-req",
        title: "Maintenance request",
        area: "Maintenance Management",
        body: "The Fiori maintenance process is phase-based. A request is raised, screened, then planned and approved before anyone is standing at the machine. That is a deliberate replacement for ‘create a notification and an order in one breath’. Malfunction reports that must move now still exist for the breakdown path.",
        system: [
          "Phases run from initiation and screening through planning, approval, preparation, scheduling, execution, post execution, and completion",
          "Notification types you will still meet: M1 malfunction, M2 activity report, M3 maintenance request (delivered examples)",
          "Technical objects: functional location and equipment",
        ],
        fiori: "Request Maintenance",
        appId: "F1511",
        tcode: "IW21",
        versusEcc:
          "ECC started at IW21 and IW31 with statuses, not with this phase model. The phase model is the S/4HANA Fiori process. F1511 has a successor in later apps — check the Fiori library before you freeze a role design.",
        flag: "Report and Repair Malfunction is F2023 and is the short breakdown path. Do not teach it as the whole of maintenance planning.",
      },
      {
        id: "am-pm",
        title: "Plant maintenance orders",
        area: "Maintenance Management (component PM)",
        body: "‘Plant Maintenance’ is the component name on the transactions. The order (delivered type PM01 for corrective work) holds operations, components, and settlement. Components come from stock (a reservation, issued like any other goods issue) or from purchasing. Confirmation posts the labor. The order collects cost and settles it — to a cost center, a WBS, or another receiver — as Universal Journal lines.",
        system: [
          "Order type PM01 — IW31 create",
          "Confirmation — IW41, or Perform Maintenance Jobs (F5104A)",
          "Manage Maintenance Orders — F5241",
        ],
        fiori: "Manage Maintenance Orders",
        appId: "F5241",
        tcode: "IW31 · IW41 · IL01",
        versusEcc:
          "The PM order is recognizable. Costs no longer sit only in a CO order to be reconciled later; settlement and the goods issues post in ACDOCA. Maintenance plans (time-based or performance-based) still generate the due orders.",
      },
      {
        id: "am-ehs",
        title: "Environment, health, and safety",
        area: "EHS",
        body: "EHS on S/4HANA records incidents, risks, and — where licensed — chemical and environment data. A maintenance job that needs a permit or a risk assessment should point at that record, not at a paper folder. It is related to Asset Management in how plants organize the work. It is not a renamed plant-maintenance order.",
        system: [
          "Incident recording and investigation",
          "Risk assessment linked to a location or a task",
          "Chemical and regulatory data where product and environment scope is active",
        ],
        fiori: "Manage Incidents",
        tcode: "Use the EHS Fiori apps for the process you licensed",
        flag: "The 2025 Enterprise Management table of contents opens Asset Management at Maintenance Management. Treat detailed EHS scope as something to verify in that Feature Scope Description and in the license — do not import Cloud Public EHS scope items.",
      },
    ],
  },
  {
    id: "hr",
    place: "The pavilion",
    name: "Human resources",
    art: "/art/hr.jpg",
    accent: "hr",
    fsd: "Core HR and Time Recording · Time Sheet Management · Integration with External HR System",
    blurb:
      "People master data, time sheets, and payroll that can post to the journal. Talent suites usually live in SuccessFactors, not in this system.",
    stations: [
      {
        id: "hr-core",
        title: "Core HR",
        area: "Core HR and Time Recording",
        body: "On-premise core HR is still personnel administration and organizational management: a person, a position, infotypes for organizational assignment and pay. Hiring and other status changes are personnel actions. In S/4HANA the employee is also synchronized to a business partner so that processes outside HR can point at the same person.",
        system: [
          "PA40 — personnel actions; PA30 — maintain master data; PA20 — display",
          "Infotypes you will meet first: 0000 actions, 0001 organizational assignment, 0002 personal data, 0007 planned working time, 0008 basic pay",
          "Employee business partner role BUP003",
        ],
        fiori: "Employee fact sheet and the HR master-data apps in your role",
        tcode: "PA40 · PA30 · PPOME",
        versusEcc:
          "The infotype model is the HCM model. What S/4HANA adds for integration is the employee business partner, so maintenance, projects, and purchasing are not holding a second person number with no link.",
        flag: "The Feature Scope Description’s HR chapter is short on purpose. Many landscapes keep core HR here and run Employee Central in SuccessFactors. The third official section is Integration with an External HR System — teach that integration rather than pretending one box always holds everything.",
      },
      {
        id: "hr-time",
        title: "Time sheet",
        area: "Time Sheet Management",
        body: "Cross-application time sheets (CATS) are how hours reach a cost center, a maintenance order, a production order, or a project activity. The employee enters time; a transfer posts it to the target. That transfer is a real document, not a report. Fiori exposes the same idea as My Timesheet.",
        system: [
          "CAT2 — enter times; CATS_DA or the transfer apps send them to the target",
          "Receiver can be a cost center, PM order, PS network activity, or WBS",
          "Attendance and absence can also come from time evaluation rather than a sheet",
        ],
        fiori: "My Timesheet",
        tcode: "CAT2",
        flag: "Confirm the My Timesheet app ID for 2025 FPS01. Which targets are allowed is the data-entry profile, and it is different in almost every client.",
      },
      {
        id: "hr-pay",
        title: "Payroll",
        area: "Core HR — country payroll",
        body: "On-premise S/4HANA can still run SAP HCM payroll: a country schema, a payroll driver, a result, then a posting run into accounting. The posting creates a vendor-style or balance-sheet document that lands in ACDOCA (wages payable, tax, expense on the cost center). It is country software. A system in one country does not secretly contain every other country’s schema.",
        system: [
          "Payroll driver is country-specific (the RPCALC* family)",
          "Posting to accounting — PCP0 — creates the FI document",
          "The employee’s cost center on infotype 0001 is the usual expense assignment",
        ],
        fiori: "Payroll apps for the country version you run",
        tcode: "PCP0 and the country payroll driver",
        flag: "The 2025 Feature Scope Description HR headings that were checked are Core HR and Time Recording, Time Sheet Management, and Integration with an External HR System. Payroll depth is country content inside on-premise HCM, not a fourth title you should invent. Many customers post from Employee Central Payroll instead. Confirm the country version before a demo.",
      },
      {
        id: "hr-talent",
        title: "Talent management",
        area: "Usually SuccessFactors — not this stack",
        body: "Recruiting, learning, performance, and succession that people mean by ‘talent management’ are SAP SuccessFactors processes. They are not a chapter of the on-premise 2025 Feature Scope Description, and they are not installed by FPS01. Core HR here can integrate to that external HR system. Teach the integration; do not draw a Talent building that pretends to be PA30.",
        system: [
          "On-premise book: personnel administration, time, payroll posting, external HR integration",
          "SuccessFactors: recruiting, onboarding, learning, performance, succession",
          "Employee central may be the system of record, with S/4 consuming the mini-master",
        ],
        fiori: "None inside S/4HANA for the SuccessFactors talent suite",
        tcode: "—",
        flag: "Older on-premise talent transactions exist in some compatibility landscapes. Do not design a new talent process on them.",
      },
    ],
  },
  {
    id: "project",
    place: "The bridgeworks",
    name: "Project system",
    art: "/art/project.jpg",
    accent: "project",
    fsd: "Operational Project System inside S/4HANA (WBS, networks, settlement to the Universal Journal). Portfolio management is a separate EPPM feature-scope document.",
    blurb:
      "A project pulls a purchase order from procurement, hours from HR, and posts the cost into Finance against a WBS element.",
    stations: [
      {
        id: "ps-plan",
        title: "Project planning",
        area: "Project structure",
        body: "A project definition is the header. WBS elements break the work down for cost and dates. Networks and activities are how you schedule, assign work centers, and hang components when the work is logistics-heavy. The classic place you see the whole structure is Project Builder. Lighter enterprise projects use WBS for cost without a network — say which one you mean.",
        system: [
          "CJ20N — Project Builder",
          "Project definition, WBS, network, activity, milestone",
          "Dates on activities schedule; WBS summarizes",
        ],
        fiori: "Project Builder · Project Control",
        tcode: "CJ20N",
        flag: "Fiori names for project control moved across releases. CJ20N is the stable object. SAP Portfolio and Project Management (portfolio buckets, decision points) is documented in its own feature scope for S/4HANA, not as a transaction inside CJ20N.",
      },
      {
        id: "ps-fin",
        title: "Project financials",
        area: "Cost and settlement",
        body: "A WBS element is an account assignment on ACDOCA, the same way a cost center is. Commitments come from purchase orders; actuals come from goods receipts, invoices, activity confirmations, and time sheets. Budget and availability control stop an over-posting if you switch them on. Settlement (CJ88) moves the balance to a cost center, an asset, or another receiver at period end.",
        system: [
          "CJ30 — original budget; availability control is a status, not a hope",
          "CJ88 — settlement",
          "Actual line items carry the WBS in ACDOCA",
        ],
        fiori: "Project Cost Report · Manage Project Budget",
        tcode: "CJ30 · CJ40 · CJ88",
        versusEcc:
          "The WBS as an account assignment object is familiar. The line items are Universal Journal lines, so a financial statement and a project report read the same posting.",
        flag: "Confirm the current project-cost Fiori app IDs for 2025 FPS01. Event-based settlement exists for some scenarios; many projects still run CJ88. Do not announce that settlement is gone.",
      },
      {
        id: "ps-log",
        title: "Project logistics",
        area: "Components and labor",
        body: "A component on a network activity becomes a reservation or a purchase requisition, depending on procurement type. That requisition is ordinary Operational Procurement from there: purchase order, goods receipt into stock or straight to the project, invoice. Labor arrives as a network confirmation or as a CATS time sheet aimed at the activity. Both post cost to the WBS and therefore into Finance.",
        system: [
          "Component on the activity — reservation or PR",
          "Confirmation of the activity — CN25",
          "CAT2 time sheet with the network activity as receiver",
        ],
        fiori: "Manage Purchase Requisitions, once the project has raised them",
        tcode: "CJ20N · CN25 · CAT2 · ME21N",
        flag: "Procuring directly to the WBS (account assignment P or Q, depending on non-valuated or valuated project stock) is a design choice. Teach the stock type your project actually uses.",
      },
    ],
  },
];

export const bridges: Bridge[] = [
  {
    id: "p2p",
    name: "Procure-to-pay",
    summary:
      "A request becomes a purchase order, the yard receives it, and Finance pays the supplier. Three wings, one journal.",
    wingIds: ["procurement", "supply", "finance"],
    beats: [
      {
        wingId: "procurement",
        text: "Requisition type NB, then a purchase order (type NB) to a business partner with roles FLVN00 and FLVN01. A contract or an info record can be the source.",
      },
      {
        wingId: "supply",
        text: "Goods receipt movement 101. In a storage location that is only inventory-managed, stock is unrestricted or in quality. In embedded EWM the inbound delivery creates putaway tasks before you trust the bin.",
      },
      {
        wingId: "finance",
        text: "MIRO posts document type RE and clears GR/IR when the three-way match holds. F110 (Manage Automatic Payments, F0770) pays the open item. Every valuated step is already in ACDOCA.",
      },
    ],
  },
  {
    id: "o2c",
    name: "Order-to-cash",
    summary:
      "A sales order promises a date, the yard picks and ships, Transportation may plan the truck, and billing recognizes revenue.",
    wingIds: ["sales", "supply", "finance"],
    beats: [
      {
        wingId: "sales",
        text: "Order type OR, item category TAN. Pricing runs the condition technique. aATP confirms the schedule line. The sold-to party is a business partner.",
      },
      {
        wingId: "supply",
        text: "Outbound delivery, pick, goods issue movement 601. Embedded EWM does the warehouse tasks. Embedded TM builds freight units and a freight order when transportation is in scope. Batch determination runs here if the material is batch-managed.",
      },
      {
        wingId: "finance",
        text: "Billing type F2 creates accounting document RV in ACDOCA. Event-based revenue recognition posts at goods issue or invoice according to the recognition key. The incoming payment clears the customer item.",
      },
    ],
  },
  {
    id: "p2prod",
    name: "Plan-to-produce",
    summary:
      "MRP proposes, the warehouse stages components, the order is confirmed, and Finance sees the issue, the receipt, and the variance.",
    wingIds: ["manufacturing", "supply", "finance"],
    beats: [
      {
        wingId: "manufacturing",
        text: "MRP Live (MD01N) reads a production version and writes planned orders. Convert to a production order (PP01). In-process inspection type 03 can sit on an operation.",
      },
      {
        wingId: "supply",
        text: "Component staging: a reservation, or an embedded EWM staging task to the production supply area. Batch determination can choose the component batch.",
      },
      {
        wingId: "manufacturing",
        text: "Confirmation (CO11N) posts yield and activities. Goods issue 261, goods receipt 101. Inspection type 04 can hold the receipt until the usage decision.",
      },
      {
        wingId: "finance",
        text: "Issues, receipts, and — if event-based order costing is active — WIP and variance are ACDOCA lines. Otherwise settlement (KO88) still clears the order at period end. Say which one the plant uses.",
      },
    ],
  },
  {
    id: "a2m",
    name: "Asset-to-maintenance",
    summary:
      "A technical object needs work. The order consumes spares from the yard or from a purchase, and the cost settles into Finance.",
    wingIds: ["asset", "manufacturing", "finance"],
    beats: [
      {
        wingId: "asset",
        text: "Request Maintenance (F1511) or a malfunction (F2023), then a PM order (PM01, IW31 / F5241) on a functional location or equipment.",
      },
      {
        wingId: "manufacturing",
        text: "The order’s components are materials. Stock issues come from inventory or EWM; a missing spare becomes a purchase requisition. This is the same material master manufacturing plans — not a second catalog.",
      },
      {
        wingId: "finance",
        text: "Confirmations and goods issues post to the order. Settlement sends the cost to a cost center or a WBS. An asset under construction only gets involved when the work is capital, not when it is a repair.",
      },
    ],
  },
  {
    id: "qm-gates",
    name: "Quality gates",
    summary:
      "The same usage decision shows up in three places: inbound receipts, production yield, and customer returns. Stock stays in quality until someone decides.",
    wingIds: ["manufacturing", "supply", "sales"],
    beats: [
      {
        wingId: "supply",
        text: "Inbound: inspection type 01 at goods receipt for a purchase order. Usage decision QA11 moves the quantity out of quality stock. In EWM, the decision is tied to the warehouse inspection, not a shadow IM posting.",
      },
      {
        wingId: "manufacturing",
        text: "In-process type 03 during the order, type 04 at goods receipt from production. A rejected usage decision is scrap or rework, not silent unrestricted stock.",
      },
      {
        wingId: "sales",
        text: "A return delivery brings the quantity back. A returns inspection type (often a copy of type 06 — confirm it on the material) decides whether it can be sold again. Credit memo billing type G2 is a commercial document; it does not replace the usage decision.",
      },
    ],
  },
  {
    id: "ps-hub",
    name: "Project hub",
    summary:
      "Project System does not buy, hire, or post on its own. It calls Procurement, takes labor from HR, and lands every cost in Finance.",
    wingIds: ["project", "procurement", "hr", "finance"],
    beats: [
      {
        wingId: "project",
        text: "CJ20N: WBS for the cost, a network activity for the work, a component on the activity when something must be procured or reserved.",
      },
      {
        wingId: "procurement",
        text: "The component becomes a purchase requisition, then a normal purchase order. Account assignment points back at the WBS or the activity.",
      },
      {
        wingId: "hr",
        text: "Hours arrive through CATS (CAT2), receiver = network activity, or through an activity confirmation (CN25).",
      },
      {
        wingId: "finance",
        text: "Actuals sit on the WBS in ACDOCA. Budget (CJ30) can block a posting. Settlement (CJ88) moves the balance to the receiver the project promised — cost center, asset, or profitability segment.",
      },
    ],
  },
];

export function wingById(id: string): Wing | undefined {
  return wings.find((w) => w.id === id);
}

export function isWingComplete(wing: Wing, read: readonly string[]): boolean {
  return wing.stations.every((s) => read.includes(s.id));
}

export function isWingUnlocked(wingId: string, read: readonly string[]): boolean {
  const index = wings.findIndex((w) => w.id === wingId);
  if (index <= 0) return true;
  return isWingComplete(wings[index - 1], read);
}

export function isStationUnlocked(wing: Wing, stationId: string, read: readonly string[]): boolean {
  if (!isWingUnlocked(wing.id, read)) return false;
  const index = wing.stations.findIndex((s) => s.id === stationId);
  if (index <= 0) return true;
  return read.includes(wing.stations[index - 1].id);
}

export function nextWing(wingId: string): Wing | undefined {
  const index = wings.findIndex((w) => w.id === wingId);
  return wings[index + 1];
}

export function stampedCount(read: readonly string[]): number {
  return wings.filter((w) => isWingComplete(w, read)).length;
}

export function currentWing(read: readonly string[]): Wing {
  return wings.find((w) => isWingUnlocked(w.id, read) && !isWingComplete(w, read)) ?? wings[wings.length - 1];
}
