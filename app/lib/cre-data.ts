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

export type EvidenceRecord = {
  id: string;
  propertyId: string;
  title: string;
  source: string;
  locator: string;
  excerpt: string;
  hash: string;
};

export type CountryCode = "AFG" | "BGD" | "BTN" | "IND" | "PAK" | "LKA";

export type CountryProfile = {
  code: CountryCode;
  name: string;
  companyCount: number;
  projectCount: number;
  expertiseCount: number;
  primaryCompany: string;
  sampleCompanies: string[];
  sampleWebsites: string[];
  sourceFiles: string[];
  momentumBias: number;
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

export const evidenceCorpus: EvidenceRecord[] = [
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

const countrySeeds: Record<CountryCode, Omit<CountryProfile, "projectCount" | "momentumBias"> & {
  knownProjectCount?: number;
}> = {
  AFG: {
    code: "AFG",
    name: "Afghanistan",
    companyCount: 60,
    expertiseCount: 5,
    primaryCompany: "Afghan Construction Company",
    sampleCompanies: [
      "Afghan Construction Company",
      "Kabul Construction Company",
      "Herat Developers",
      "Mazar Construction",
    ],
    sampleWebsites: [
      "https://www.afghanconstruction.af/",
      "https://www.kabulconstruction.af/",
      "https://www.heratdevelopers.af/",
      "https://www.mazarconstruction.af/",
    ],
    sourceFiles: ["team1_Afghanistan_sk.json"],
  },
  BGD: {
    code: "BGD",
    name: "Bangladesh",
    companyCount: 100,
    expertiseCount: 8,
    primaryCompany: "Building Technology & Ideas Ltd.",
    sampleCompanies: [
      "Building Technology & Ideas Ltd.",
      "Bashundhara Group",
      "Bay Developments Ltd",
      "Shanta Holdings Ltd",
    ],
    sampleWebsites: [
      "https://www.bti.com.bd/",
      "https://www.bashundharagroup.com/",
      "https://www.baydevelopments.com/",
      "https://www.shantaholdings.com/",
    ],
    sourceFiles: ["team1_bangladesh_sk.json"],
  },
  BTN: {
    code: "BTN",
    name: "Bhutan",
    companyCount: 56,
    expertiseCount: 4,
    primaryCompany: "Construction Development Corporation Limited",
    sampleCompanies: [
      "Construction Development Corporation Limited",
      "Bhutan Board Products Ltd",
      "National Housing Development Corporation",
      "Thimphu City Corporation",
    ],
    sampleWebsites: [
      "https://www.cdcl.bt/",
      "https://www.bbpl.bt/",
      "https://www.nhdc.gov.bt/",
      "https://www.thimphu.bt/",
    ],
    sourceFiles: ["team1_bhutan_sk.json"],
  },
  IND: {
    code: "IND",
    name: "India",
    companyCount: 100,
    knownProjectCount: 31,
    expertiseCount: 12,
    primaryCompany: "DLF Ltd",
    sampleCompanies: [
      "DLF Ltd",
      "Godrej Properties Ltd",
      "Oberoi Realty",
      "Macrotech Developers (Lodha Group)",
    ],
    sampleWebsites: [
      "https://www.dlf.in/",
      "https://www.godrejproperties.com/",
      "https://www.oberoirealty.com/",
      "https://www.lodhagroup.in/",
    ],
    sourceFiles: ["team1_india_sk.json", "team3_india_sk.json"],
  },
  PAK: {
    code: "PAK",
    name: "Pakistan",
    companyCount: 49,
    expertiseCount: 5,
    primaryCompany: "SRS Jaidaad",
    sampleCompanies: [
      "SRS Jaidaad",
      "Fourwalls",
      "Sierra Properties",
      "Best Estate & Builders",
    ],
    sampleWebsites: [
      "https://srsjaidaad.com/",
      "https://thefourwalls.pk/",
      "https://sierraproperties.pk/",
      "https://bestestatebuilders.com/",
    ],
    sourceFiles: ["team1_pakistan.json"],
  },
  LKA: {
    code: "LKA",
    name: "Sri Lanka",
    companyCount: 104,
    knownProjectCount: 13,
    expertiseCount: 6,
    primaryCompany: "Fairway Holdings",
    sampleCompanies: [
      "Fairway Holdings",
      "Prime Lands (Prime Group)",
      "John Keells Properties",
      "Port City Colombo",
    ],
    sampleWebsites: [
      "https://fairwayholdings.com/",
      "https://www.primelands.lk/",
      "https://www.johnkeellsproperties.com/",
      "https://portcitycolombo.lk/",
    ],
    sourceFiles: ["team1_srilanka_sk.json", "team3_srilanka_sk.json"],
  },
};

const countryDistricts: Record<CountryCode, string[]> = {
  AFG: ["Kabul", "Herat", "Mazar-i-Sharif", "Kandahar"],
  BGD: ["Dhaka", "Chattogram", "Gazipur", "Narayanganj"],
  BTN: ["Thimphu", "Paro", "Phuentsholing", "Punakha"],
  IND: ["Mumbai", "Bengaluru", "Delhi NCR", "Hyderabad"],
  PAK: ["Karachi", "Lahore", "Islamabad", "Rawalpindi"],
  LKA: ["Colombo", "Rajagiriya", "Battaramulla", "Galle"],
};

const assetSignals = [
  "Urban logistics demand",
  "Rental reversion",
  "Transit-led densification",
  "Redevelopment optionality",
];

const assetTypes = [
  "Urban logistics",
  "Grade A office",
  "Mixed-use",
  "Retail & office",
];

const markerPositions: Array<{ x: number; y: number }> = [
  { x: 61, y: 31 },
  { x: 74, y: 52 },
  { x: 84, y: 42 },
  { x: 49, y: 58 },
];

export const defaultCountryCode: CountryCode = "IND";

export function listCountryProfiles(): CountryProfile[] {
  return (Object.keys(countrySeeds) as CountryCode[]).map((code) => getCountryProfile(code));
}

export function getCountryProfile(code: CountryCode): CountryProfile {
  const seed = countrySeeds[code];
  const projectCount = seed.knownProjectCount ?? Math.max(7, Math.round(seed.companyCount * 0.14));
  const momentumRaw = (seed.companyCount - 70) / 620 + (projectCount - 11) / 180;
  const momentumBias = Math.max(-0.05, Math.min(0.1, Number(momentumRaw.toFixed(3))));
  return {
    code: seed.code,
    name: seed.name,
    companyCount: seed.companyCount,
    projectCount,
    expertiseCount: seed.expertiseCount,
    primaryCompany: seed.primaryCompany,
    sampleCompanies: seed.sampleCompanies,
    sampleWebsites: seed.sampleWebsites,
    sourceFiles: seed.sourceFiles,
    momentumBias,
  };
}

function shortName(companyName: string) {
  return companyName
    .replace(/\b(Ltd\.?|Limited|Group|Holdings|Corporation|Developers|Properties|Company)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pseudoHash(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(8, "0")}…demo`;
}

export function getCountryProperties(code: CountryCode): PropertyRecord[] {
  const profile = getCountryProfile(code);
  const districts = countryDistricts[code];
  return profile.sampleCompanies.slice(0, 4).map((companyName, index) => {
    const district = districts[index] ?? districts[0];
    const basePrice = 14 + profile.companyCount * 0.36 + index * 6.2;
    const capRate = 4.6 + ((profile.companyCount + index * 3) % 9) * 0.17;
    const occupancy = 74 + ((profile.projectCount + index * 5) % 22);
    const score = Math.max(
      70,
      Math.min(97, Math.round(76 + profile.momentumBias * 120 + index * 2.8)),
    );
    return {
      id: `${code}-${index + 1}`,
      name: `${shortName(companyName)} ${["Hub", "Tower", "Exchange", "Quarter"][index]}`,
      address: `${10 + index * 3} ${district} Corridor`,
      district,
      type: assetTypes[index] ?? "Mixed-use",
      price: `$${basePrice.toFixed(1)}m`,
      capRate: `${capRate.toFixed(1)}%`,
      occupancy: `${Math.min(98, occupancy)}%`,
      score,
      signal: assetSignals[index] ?? "Market momentum",
      x: markerPositions[index]?.x ?? 60,
      y: markerPositions[index]?.y ?? 40,
    };
  });
}

export function getCountryEvidence(code: CountryCode): EvidenceRecord[] {
  const profile = getCountryProfile(code);
  const countryProperties = getCountryProperties(code);
  return countryProperties.flatMap((property, index) => {
    const website = profile.sampleWebsites[index] ?? profile.sampleWebsites[0] ?? "n/a";
    const company = profile.sampleCompanies[index] ?? profile.primaryCompany;
    return [
      {
        id: `${property.id}-E1`,
        propertyId: property.id,
        title: `${profile.name} company registry snapshot`,
        source: "Country dataset",
        locator: `${profile.sourceFiles[0]} · row ${index + 1}`,
        excerpt: `${company} is part of the curated ${profile.name} real-estate company list with ${profile.companyCount} tracked organizations.`,
        hash: pseudoHash(`${property.id}:registry:${company}`),
      },
      {
        id: `${property.id}-E2`,
        propertyId: property.id,
        title: `${company} public website signal`,
        source: "Company website",
        locator: website,
        excerpt: `Public footprint from ${website} aligns with ${property.type.toLowerCase()} strategy in ${property.district}.`,
        hash: pseudoHash(`${property.id}:website:${website}`),
      },
    ];
  });
}

export function getCountryMarketSeries(code: CountryCode, model: "convlstm" | "predrnn") {
  const base = marketSeries[model];
  const bias = getCountryProfile(code).momentumBias;
  const end = Math.max(1, base.length - 1);
  return base.map((value, index) => {
    const trendFactor = 1 + bias * (index / end);
    return Math.max(1, Math.round(value * trendFactor));
  });
}

