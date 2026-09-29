export type MasterItem = {
  id: string;
  title: string;
  blurb: string;
  tcode: string;
  fiori: string;
  versusEcc: string;
};

export type MasterTree = {
  id: string;
  /** Building this tree stands beside. */
  wingId: string;
  /** Base of the trunk, percent of the campus map. Path side, against the house. */
  cx: number;
  cy: number;
  sign: string;
  intro: string;
  items: MasterItem[];
};

export const masterTrees: MasterTree[] = [
  {
    id: "rnd",
    wingId: "rnd",
    cx: 31.5,
    cy: 18,
    sign: "Research and development (R&D)",
    intro: "The product master comes first, then the bill of material (BOM). Manufacturing reads both.",
    items: [
      {
        id: "rd-mat",
        title: "Material",
        blurb: "The product you buy, make, store, and sell.",
        tcode: "Create material (MM01) · Change material (MM02)",
        fiori: "Manage Product Master Data",
        versusEcc: "MM01 still creates the material. The material ledger is mandatory, so valuation is always on.",
      },
      {
        id: "rd-bom",
        title: "Bill of material (BOM)",
        blurb: "The components of the product.",
        tcode: "Create bill of material (CS01)",
        fiori: "Maintain Bill of Material",
        versusEcc: "The bill of material is still the component list. A production version, on the manufacturing tree, is what makes one alternative valid for planning.",
      },
    ],
  },
  {
    id: "finance",
    wingId: "finance",
    cx: 55.5,
    cy: 19,
    sign: "Finance",
    intro: "The cost center is the master that other objects assign to. There is no separate cost-center building.",
    items: [
      {
        id: "ks01",
        title: "Cost center",
        blurb: "Where cost is collected.",
        tcode: "Create cost center (KS01)",
        fiori: "Manage Cost Centers",
        versusEcc: "KS01 still creates the cost center. A journal line can carry it. A fixed asset can be assigned to it. A work center posts its activity to it.",
      },
    ],
  },
  {
    id: "people",
    wingId: "hr",
    cx: 70,
    cy: 19.5,
    sign: "People",
    intro: "The employee is the person the other buildings can point at. The same person is also a business partner.",
    items: [
      {
        id: "hr-core",
        title: "Employee",
        blurb: "Personnel number, organizational assignment, and personal data.",
        tcode: "Personnel actions (PA40) · Maintain master data (PA30)",
        fiori: "Employee fact sheet",
        versusEcc: "The infotypes are the same human-capital model as in ECC. S/4HANA also syncs the employee to a business partner, so maintenance, projects, and purchasing share that person.",
      },
    ],
  },
  {
    id: "procurement",
    wingId: "procurement",
    cx: 23,
    cy: 39,
    sign: "Procurement",
    intro: "One business partner. The customer role and the supplier role sit on that partner. There is no separate customer building.",
    items: [
      {
        id: "bp-one",
        title: "Business partner",
        blurb: "One number, one name.",
        tcode: "Maintain business partner (BP)",
        fiori: "Manage Business Partner Master Data",
        versusEcc: "ECC kept a customer master and a supplier master apart. S/4HANA keeps one business partner. Customer and supplier are roles on it.",
      },
      {
        id: "bp-cust",
        title: "Customer role",
        blurb: "Finance and sales data on the same partner.",
        tcode: "Business partner (BP) · customer role",
        fiori: "Manage Business Partner Master Data",
        versusEcc: "XD01 created a customer. That customer is now a role. Company-code and sales-area data still exist, on the same partner number as the supplier role.",
      },
      {
        id: "pr-sup",
        title: "Supplier role",
        blurb: "Finance and purchasing data on the same partner.",
        tcode: "Business partner (BP) · supplier role",
        fiori: "Manage Business Partner Master Data",
        versusEcc: "XK01 created a supplier. That supplier is now a role. Company-code and purchasing data still exist. This is the same partner as the customer role.",
      },
    ],
  },
  {
    id: "sales",
    wingId: "sales",
    cx: 76,
    cy: 45,
    sign: "Sales",
    intro: "The customer role and the price the order will find. The customer is a role on the business partner, not a second building.",
    items: [
      {
        id: "bp-cust",
        title: "Customer role",
        blurb: "The sold-to party on the order.",
        tcode: "Business partner (BP) · customer role",
        fiori: "Manage Business Partner Master Data",
        versusEcc: "XD01 created a customer. Sales now reads a business partner with the customer role. Ship-to and bill-to are partner functions on the order.",
      },
      {
        id: "sd-pr",
        title: "Price condition",
        blurb: "The price record the order finds.",
        tcode: "Create condition (VK11) · Change condition (VK12)",
        fiori: "Manage Prices — Sales",
        versusEcc: "VK11 still maintains the condition record. The price calculated on the order is stored with the sales document.",
      },
    ],
  },
  {
    id: "supply",
    wingId: "supply",
    cx: 33,
    cy: 62,
    sign: "Supply chain",
    intro: "The material the yard stocks, and the batch it picks from.",
    items: [
      {
        id: "rd-mat",
        title: "Material",
        blurb: "Plant and storage data the goods movement reads.",
        tcode: "Create material (MM01) · Change material (MM02)",
        fiori: "Manage Product Master Data",
        versusEcc: "The material is the same master as in research and development (R&D). Stock is kept by plant, storage location, and, when used, batch.",
      },
      {
        id: "sc-batch",
        title: "Batch",
        blurb: "A quantity of one material that shares a shelf life.",
        tcode: "Create batch (MSC1N) · Change batch (MSC2N)",
        fiori: "Manage Batches",
        versusEcc: "MSC1N still creates the batch. Determination can propose it on a delivery, a production order, or a goods movement.",
      },
    ],
  },
  {
    id: "mfg",
    wingId: "manufacturing",
    cx: 61.5,
    cy: 65,
    sign: "Manufacturing",
    intro: "Masters the works read before a production order. The routing stays with the production version.",
    items: [
      {
        id: "rd-mat",
        title: "Material",
        blurb: "The product the order is built for.",
        tcode: "Create material (MM01) · Change material (MM02)",
        fiori: "Manage Product Master Data",
        versusEcc: "MM01 still creates the material. The material ledger is mandatory, so valuation is always on. Other buildings read the plant, sales, and valuation views of this same material.",
      },
      {
        id: "rd-bom",
        title: "Bill of material (BOM)",
        blurb: "The components of the finished good.",
        tcode: "Create bill of material (CS01)",
        fiori: "Maintain Bill of Material",
        versusEcc: "The bill of material is still the component list. A production version is what makes one alternative valid for planning and production.",
      },
      {
        id: "pp-eng",
        title: "Production version",
        blurb: "Points at one bill of material and one routing.",
        tcode: "Production version (C223)",
        fiori: "Manage Production Versions",
        versusEcc: "In ECC a routing could be found by selection. In S/4HANA the production version is required: it names the bill of material alternative and the routing. The routing is not its own master on this tree.",
      },
      {
        id: "wc-cr01",
        title: "Work center",
        blurb: "Where a routing operation is performed.",
        tcode: "Create work center (CR01)",
        fiori: "Manage Work Centers",
        versusEcc: "CR01 still creates the work center. The operation on the routing names this work center, and the work center names the cost center its activity posts to.",
      },
    ],
  },
  {
    id: "maint",
    wingId: "asset",
    cx: 35,
    cy: 76,
    sign: "Maintenance",
    intro: "Masters in place before a maintenance request. The location comes first. Equipment is installed in it.",
    items: [
      {
        id: "fl-il01",
        title: "Functional location",
        blurb: "The place in the plant.",
        tcode: "Create functional location (IL01)",
        fiori: "Manage Functional Locations",
        versusEcc: "IL01 still creates the location. The hierarchy of places is unchanged: a location can sit under a superior location.",
      },
      {
        id: "eq-ie01",
        title: "Equipment",
        blurb: "The object installed in that location.",
        tcode: "Create equipment (IE01)",
        fiori: "Manage Equipment",
        versusEcc: "IE01 still creates the equipment. Install it in the functional location. The maintenance request then names the location, the equipment, or both.",
      },
    ],
  },
  {
    id: "service",
    wingId: "service",
    cx: 73,
    cy: 78,
    sign: "Service",
    intro: "The product a service order item uses, and the customer the order is for.",
    items: [
      {
        id: "sv-prod",
        title: "Service product",
        blurb: "Labor on the service order, stored as a material.",
        tcode: "Create material (MM01) · material type Service",
        fiori: "Manage Product Master Data",
        versusEcc: "A service product is a material with a service material type. The service order in S/4HANA Service is its own document, not a plant-maintenance order.",
      },
      {
        id: "bp-cust",
        title: "Customer role",
        blurb: "The sold-to party on the service order.",
        tcode: "Business partner (BP) · customer role",
        fiori: "Manage Business Partner Master Data",
        versusEcc: "The sold-to party is a business partner with the customer role, the same partner sales uses.",
      },
    ],
  },
  {
    id: "project",
    wingId: "project",
    cx: 20,
    cy: 82,
    sign: "Projects",
    intro: "The project definition and its work breakdown structure (WBS). Purchasing, time, and maintenance post cost to a WBS element.",
    items: [
      {
        id: "ps-plan",
        title: "Project and work breakdown structure (WBS)",
        blurb: "The header, then the elements that collect cost.",
        tcode: "Project Builder (CJ20N)",
        fiori: "Project Builder",
        versusEcc: "CJ20N still builds the project and the work breakdown structure (WBS). Cost on a WBS element is a journal line.",
      },
    ],
  },
];

export function masterTreeById(id: string) {
  return masterTrees.find((tree) => tree.id === id);
}
