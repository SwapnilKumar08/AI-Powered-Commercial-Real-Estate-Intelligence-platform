export type PropertyRecord = {
  id: string;
  name: string;
  address: string;
  district: string;
  type: string;
  price: string;
  capRate: string;
  occupancy: string;
  score: number;
  signal: string;
  x: number;
  y: number;
};

export const properties: PropertyRecord[] = [
  {
    id: "ARG-01",
    name: "The Arches",
    address: "14–18 York Way",
    district: "King’s Cross · N1",
    type: "Urban logistics",
    price: "£28.4m",
    capRate: "5.8%",
    occupancy: "82%",
    score: 94,
    signal: "Life-science conversion",
    x: 61,
    y: 31,
  },
  {
    id: "BKS-17",
    name: "Bishopsgate House",
    address: "177 Bishopsgate",
    district: "City Core · EC2",
    type: "Grade A office",
    price: "£76.2m",
    capRate: "4.9%",
    occupancy: "91%",
    score: 88,
    signal: "Rental reversion",
    x: 74,
    y: 52,
  },
  {
    id: "CRS-04",
    name: "Crossrail Works",
    address: "8 Pudding Mill Lane",
    district: "Stratford · E15",
    type: "Mixed-use",
    price: "£41.7m",
    capRate: "5.4%",
    occupancy: "76%",
    score: 86,
    signal: "Planning uplift",
    x: 84,
    y: 42,
  },
  {
    id: "MRC-09",
    name: "Mercer Yard",
    address: "24–30 Mercer Street",
    district: "Covent Garden · WC2",
    type: "Retail & office",
    price: "£53.9m",
    capRate: "4.6%",
    occupancy: "95%",
    score: 81,
    signal: "Tourism recovery",
    x: 49,
    y: 58,
  },
];

export const evidenceCorpus = [
  {
    id: "EV-102",
    propertyId: "ARG-01",
    title: "Camden Planning Committee",
    source: "Planning portal",
    locator: "Application 2026/1841/P · §4.2",
    excerpt:
      "The proposal supports laboratory-enabled employment space and improved servicing access along York Way.",
    hash: "sha256:19af…e283",
  },
  {
    id: "EV-117",
    propertyId: "ARG-01",
    title: "King’s Cross leasing evidence",
    source: "Broker market report",
    locator: "Q2 2026 · pages 18–19",
    excerpt:
      "Prime fitted laboratory rents increased 7.2% year on year while immediately available supply remained below nine months.",
    hash: "sha256:39bc…d821",
  },
  {
    id: "EV-123",
    propertyId: "BKS-17",
    title: "City office availability",
    source: "Market data feed",
    locator: "EC2 · weekly snapshot 24 Jul 2026",
    excerpt:
      "Grade A availability contracted for a fifth week and active requirements exceed scheduled completions by 1.4 times.",
    hash: "sha256:aa20…011f",
  },
  {
    id: "EV-131",
    propertyId: "CRS-04",
    title: "Newham development plan",
    source: "Local authority",
    locator: "Site allocation S34 · policy H3",
    excerpt:
      "The site allocation supports higher-density mixed use around Pudding Mill Lane subject to public-realm delivery.",
    hash: "sha256:c987…bd41",
  },
];

export const marketSeries = {
  convlstm: [98, 99, 101, 100, 103, 106, 108, 111, 113, 116, 119, 121],
  predrnn: [98, 100, 101, 102, 104, 107, 110, 114, 117, 121, 124, 127],
};

