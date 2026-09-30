/** SAP PRESS (Rheinwerk) titles that match the campus. Not SAP Help, and not limited to 2025 FPS01. */
export const PRESS_HOME = "https://www.sap-press.com/";

export type PressBook = {
  title: string;
  authors: string;
  href: string;
  note: string;
};

export type PressShelf = {
  area: string;
  books: PressBook[];
};

export const pressShelves: PressShelf[] = [
  {
    area: "Start here",
    books: [
      {
        title: "SAP S/4HANA: An Introduction",
        authors: "Devraj Bardhan, Axel Baumgartl, and others",
        href: "https://www.sap-press.com/sap-s4hana_5973/",
        note: "The whole suite: finance, manufacturing, supply chain, sales, and service.",
      },
      {
        title: "Using SAP S/4HANA",
        authors: "Wolfgang Fitznar, Dennis Fitznar",
        href: "https://www.sap-press.com/using-sap-s4hana_5065/",
        note: "A workday in Fiori and SAP GUI: procurement, sales, and finance.",
      },
      {
        title: "SAP Fiori Apps for SAP S/4HANA",
        authors: "Anand Seetharaju, Jon Simmonds, Tinotenda F. Chiraudi",
        href: "https://www.sap-press.com/sap-fiori-apps-for-sap-s4hana_6120/",
        note: "How the apps on the plates are found, launched, and extended.",
      },
    ],
  },
  {
    area: "Finance",
    books: [
      {
        title: "Financial Accounting with SAP S/4HANA: Business User Guide",
        authors: "Jonas Tritschler, Stefan Walz, Reinhard Rupp, Nertila Mucka",
        href: "https://www.sap-press.com/financial-accounting-with-sap-s4hana-business-user-guide_5698/",
        note: "General ledger, payables, receivables, and the close.",
      },
      {
        title: "SAP S/4HANA Finance: An Introduction",
        authors: "Maunil Mehta, Usman Aijaz, Sam Parikh, Sanjib Chattopadhyay",
        href: "https://www.sap-press.com/sap-s4hana-finance_5606/",
        note: "Architecture of the finance suite, including the Universal Journal.",
      },
      {
        title: "Asset Accounting with SAP S/4HANA",
        authors: "Stoil Jotev",
        href: "https://www.sap-press.com/asset-accounting-with-sap-s4hana_5028/",
        note: "Master data, acquisition, depreciation, and the move off classic Asset Accounting.",
      },
      {
        title: "Cash Management with SAP S/4HANA",
        authors: "Dirk Neumann, Lawrence Liang",
        href: "https://www.sap-press.com/cash-management-with-sap-s4hana_5169/",
        note: "Bank accounts, cash position, and the liquidity forecast.",
      },
      {
        title: "Treasury and Risk Management with SAP S/4HANA",
        authors: "Luke Carlson, Andrew Carlson, Jeffrey Lasecki",
        href: "https://www.sap-press.com/treasury-and-risk-management-with-sap-s4hana_5907/",
        note: "Money market, foreign exchange, securities, and hedge accounting.",
      },
      {
        title: "Introducing Universal Parallel Accounting with SAP S/4HANA",
        authors: "Smitha Chowdavarapu",
        href: "https://www.sap-press.com/introducing-universal-parallel-accounting-with-sap-s4hana_6427/",
        note: "E-Bite. Ledgers, asset accounting, inventory, and event-based revenue recognition.",
      },
    ],
  },
  {
    area: "Procurement and product master",
    books: [
      {
        title: "Sourcing and Procurement with SAP S/4HANA",
        authors: "Justin Ashlock",
        href: "https://www.sap-press.com/sourcing-and-procurement-with-sap-s4hana_5773/",
        note: "Operational purchasing, contracts, invoices, and supplier management.",
      },
      {
        title: "Materials Management with SAP S/4HANA",
        authors: "Jawad Akhtar, Martin Murray",
        href: "https://www.sap-press.com/materials-management-with-sap-s4hana_5835/",
        note: "Material master, planning, purchasing, and inventory.",
      },
      {
        title: "Business Partners in SAP S/4HANA",
        authors: "Jawad Akhtar",
        href: "https://www.sap-press.com/business-partners-in-sap-s4hana_5468/",
        note: "One number for customer and supplier. Customer-vendor integration.",
      },
    ],
  },
  {
    area: "Supply chain",
    books: [
      {
        title: "Logistics with SAP S/4HANA: An Introduction",
        authors: "Deb Bhattacharjee, Vishal Khandalkar, Falguni Thompson, Guillermo B. Vazquez",
        href: "https://www.sap-press.com/logistics-with-sap-s4hana_5509/",
        note: "Procurement, production, maintenance, sales, transportation, and the warehouse.",
      },
      {
        title: "Warehouse Management with SAP S/4HANA",
        authors: "Namita Sachan, Aman Jain",
        href: "https://www.sap-press.com/warehouse-management-with-sap-s4hana_5886/",
        note: "Embedded and decentralized EWM.",
      },
      {
        title: "Transportation Management with SAP S/4HANA",
        authors: "Bernd Lauterbach, Jens Gottlieb, Meike Helwig, Christopher Sürie, Ulrich Benz",
        href: "https://www.sap-press.com/transportation-management-with-sap-s4hana_5575/",
        note: "Freight units, freight orders, and the transportation cockpit.",
      },
      {
        title: "Available-to-Promise with SAP S/4HANA",
        authors: "Sujeet Acharya, Sandeep Mandhana, Jibi Joseph Vadakayil",
        href: "https://www.sap-press.com/available-to-promise-with-sap-s4hana_5574/",
        note: "Advanced ATP: allocation, protection, and backorder processing.",
      },
    ],
  },
  {
    area: "Manufacturing",
    books: [
      {
        title: "Production Planning with SAP S/4HANA",
        authors: "Jawad Akhtar",
        href: "https://www.sap-press.com/production-planning-with-sap-s4hana_6031/",
        note: "Discrete, process, and repetitive manufacturing, including MRP.",
      },
    ],
  },
  {
    area: "Sales",
    books: [
      {
        title: "Sales and Distribution with SAP S/4HANA: Business User Guide",
        authors: "James Olcott, Jon Simmonds",
        href: "https://www.sap-press.com/sales-and-distribution-with-sap-s4hana-business-user-guide_5263/",
        note: "Orders, pricing, delivery, and billing as a user runs them.",
      },
      {
        title: "Configuring Sales in SAP S/4HANA",
        authors: "Christian van Helfteren",
        href: "https://www.sap-press.com/configuring-sales-in-sap-s4hana_5401/",
        note: "How the sales documents on the plates are set up.",
      },
    ],
  },
  {
    area: "Service and maintenance",
    books: [
      {
        title: "SAP S/4HANA Service",
        authors: "Nicolai Geier, Martin Lenz, Yang Li, Noboru Ota, Gert Tackaert",
        href: "https://www.sap-press.com/sap-s4hana-service_6324/",
        note: "Service orders, contracts, in-house repair, and billing.",
      },
      {
        title: "Plant Maintenance with SAP: Business User Guide",
        authors: "Karl Liebstückel, Markus Seidl",
        href: "https://www.sap-press.com/plant-maintenance-with-sap-business-user-guide_6263/",
        note: "Notifications, orders, and the technical objects.",
      },
    ],
  },
  {
    area: "Projects",
    books: [
      {
        title: "Project System in SAP S/4HANA",
        authors: "Mario Franz, Andrea Langlotz",
        href: "https://www.sap-press.com/project-system-in-sap-s4hana_5631/",
        note: "Project definition, WBS, cost, and logistics on the project.",
      },
    ],
  },
];

function book(title: string): PressBook {
  const found = pressShelves.flatMap((shelf) => shelf.books).find((item) => item.title === title);
  if (!found) throw new Error(title);
  return found;
}

/** Books that belong on the shelf inside one building. */
export function shelfForWing(wingId: string): PressShelf {
  const shelves: Record<string, PressShelf> = {
    finance: pressShelves[1],
    rnd: {
      area: "Research and development",
      books: [book("Materials Management with SAP S/4HANA")],
    },
    procurement: pressShelves[2],
    supply: pressShelves[3],
    manufacturing: pressShelves[4],
    sales: pressShelves[5],
    service: {
      area: "Service",
      books: [book("SAP S/4HANA Service")],
    },
    asset: {
      area: "Asset management",
      books: [book("Plant Maintenance with SAP: Business User Guide")],
    },
    hr: {
      area: "People",
      books: [book("SAP S/4HANA: An Introduction")],
    },
    project: pressShelves[7],
  };
  return shelves[wingId] ?? { area: "SAP PRESS", books: [book("SAP S/4HANA: An Introduction")] };
}
