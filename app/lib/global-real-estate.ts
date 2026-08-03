import afghanistanCompanies from "../data/propeterra/team1_Afghanistan_sk.json";
import bangladeshCompanies from "../data/propeterra/team1_bangladesh_sk.json";
import bhutanCompanies from "../data/propeterra/team1_bhutan_sk.json";
import indiaCompanies from "../data/propeterra/team1_india_sk.json";
import pakistanCompanies from "../data/propeterra/team1_pakistan.json";
import sriLankaCompanies from "../data/propeterra/team1_srilanka_sk.json";
import indiaDeepProfiles from "../data/propeterra/team3_india_sk.json";
import sriLankaDeepProfiles from "../data/propeterra/team3_srilanka_sk.json";

import type { CountryCode } from "./cre-data";

type CompanyRow = {
  company_name?: string;
  website?: string;
};

type ProjectRow = {
  name?: string;
  description?: string;
  location?: string | null;
};

type StructuredInfo = {
  company_name?: string;
  description?: string;
  expertise_areas?: string[];
  All_real_estate_projects?: ProjectRow[];
};

type DeepRow = {
  url?: string;
  structured_info?: StructuredInfo;
};

export type GlobalPropertyRecord = {
  id: string;
  countryCode: CountryCode;
  country: string;
  companyName: string;
  website: string;
  propertyName: string;
  description: string;
  location: string;
  tags: string[];
  source: "team1" | "team3";
};

export type GlobalCountrySummary = {
  code: CountryCode;
  country: string;
  companies: number;
  projects: number;
};

const countryMeta: Record<CountryCode, { country: string; sourceTag: string }> = {
  AFG: { country: "Afghanistan", sourceTag: "team1_Afghanistan_sk.json" },
  BGD: { country: "Bangladesh", sourceTag: "team1_bangladesh_sk.json" },
  BTN: { country: "Bhutan", sourceTag: "team1_bhutan_sk.json" },
  IND: { country: "India", sourceTag: "team1_india_sk.json + team3_india_sk.json" },
  PAK: { country: "Pakistan", sourceTag: "team1_pakistan.json" },
  LKA: { country: "Sri Lanka", sourceTag: "team1_srilanka_sk.json + team3_srilanka_sk.json" },
};

const companySources: Array<{ code: CountryCode; rows: CompanyRow[] }> = [
  { code: "AFG", rows: afghanistanCompanies as CompanyRow[] },
  { code: "BGD", rows: bangladeshCompanies as CompanyRow[] },
  { code: "BTN", rows: bhutanCompanies as CompanyRow[] },
  { code: "IND", rows: indiaCompanies as CompanyRow[] },
  { code: "PAK", rows: pakistanCompanies as CompanyRow[] },
  { code: "LKA", rows: sriLankaCompanies as CompanyRow[] },
];

const deepSources: Array<{ code: CountryCode; rows: DeepRow[] }> = [
  { code: "IND", rows: indiaDeepProfiles as DeepRow[] },
  { code: "LKA", rows: sriLankaDeepProfiles as DeepRow[] },
];

function compactText(value: string | undefined | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

const team1Records: GlobalPropertyRecord[] = companySources.flatMap(({ code, rows }) => {
  const meta = countryMeta[code];
  return rows.flatMap((row) => {
    const companyName = compactText(row.company_name);
    const website = compactText(row.website);
    if (!companyName || !website) return [];
    return [
      {
        id: `${code}-company-${slug(companyName)}`,
        countryCode: code,
        country: meta.country,
        companyName,
        website,
        propertyName: `${companyName} Portfolio`,
        description: `${companyName} is listed in the Propeterra country-level real-estate dataset for ${meta.country}.`,
        location: meta.country,
        tags: ["company", "portfolio", meta.country.toLowerCase(), "real-estate"],
        source: "team1" as const,
      },
    ];
  });
});

const team3Records: GlobalPropertyRecord[] = deepSources.flatMap(({ code, rows }) => {
  const meta = countryMeta[code];
  return rows.flatMap((row, rowIndex) => {
    const info = row.structured_info;
    const companyName = compactText(info?.company_name) || `Company-${rowIndex + 1}`;
    const companyWebsite = compactText(row.url);
    const expertise = (info?.expertise_areas ?? []).map((item) => compactText(item)).filter(Boolean);
    const projects = (info?.All_real_estate_projects ?? []) as ProjectRow[];

    const companyRecord: GlobalPropertyRecord = {
      id: `${code}-deep-company-${slug(companyName)}-${rowIndex + 1}`,
      countryCode: code,
      country: meta.country,
      companyName,
      website: companyWebsite || "n/a",
      propertyName: `${companyName} Corporate Profile`,
      description:
        compactText(info?.description) ||
        `${companyName} has a structured company profile in the Propeterra deep dataset for ${meta.country}.`,
      location: meta.country,
      tags: ["company", "profile", ...expertise.slice(0, 5).map((item) => item.toLowerCase())],
      source: "team3",
    };

    const projectRecords = projects.flatMap((project, projectIndex) => {
      const projectName = compactText(project.name);
      if (!projectName) return [];
      const projectLocation = compactText(project.location) || meta.country;
      return [
        {
          id: `${code}-project-${slug(companyName)}-${slug(projectName)}-${projectIndex + 1}`,
          countryCode: code,
          country: meta.country,
          companyName,
          website: companyWebsite || "n/a",
          propertyName: projectName,
          description:
            compactText(project.description) ||
            `${projectName} is a structured real-estate project associated with ${companyName}.`,
          location: projectLocation,
          tags: ["project", "development", ...expertise.slice(0, 4).map((item) => item.toLowerCase())],
          source: "team3" as const,
        },
      ];
    });

    return [companyRecord, ...projectRecords];
  });
});

export const globalRealEstateRecords: GlobalPropertyRecord[] = [
  ...team1Records,
  ...team3Records,
];

export const globalCountrySummaries: GlobalCountrySummary[] =
  (Object.keys(countryMeta) as CountryCode[]).map((code) => {
    const records = globalRealEstateRecords.filter((record) => record.countryCode === code);
    const companies = new Set(records.map((record) => record.companyName)).size;
    const projects = records.filter((record) => record.tags.includes("project")).length;
    return {
      code,
      country: countryMeta[code].country,
      companies,
      projects,
    };
  });

export const globalSearchStats = {
  records: globalRealEstateRecords.length,
  countries: globalCountrySummaries.length,
  companies: new Set(globalRealEstateRecords.map((record) => record.companyName)).size,
  projects: globalRealEstateRecords.filter((record) => record.tags.includes("project")).length,
  indexedSources: Array.from(new Set(globalRealEstateRecords.map((record) => record.source))),
};

export function searchGlobalRealEstate(
  query: string,
  options?: { countryCode?: CountryCode | "ALL"; limit?: number },
) {
  const normalized = compactText(query).toLowerCase();
  const limit = options?.limit ?? 30;
  const queryTokens = normalized.match(/[a-z0-9]+/g) ?? [];
  const countryCode = options?.countryCode ?? "ALL";

  const scored = globalRealEstateRecords
    .filter((record) => countryCode === "ALL" || record.countryCode === countryCode)
    .map((record) => {
      if (!normalized) return { record, score: 0 };

      const haystack = [
        record.propertyName,
        record.companyName,
        record.country,
        record.location,
        record.description,
        record.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      let tokenHits = 0;
      for (const token of queryTokens) {
        if (haystack.includes(token)) tokenHits += 1;
      }
      const completeness = queryTokens.length ? tokenHits / queryTokens.length : 0;
      const exactBoost =
        record.propertyName.toLowerCase().includes(normalized) ||
        record.companyName.toLowerCase().includes(normalized)
          ? 0.45
          : 0;
      const sourceBoost = record.source === "team3" ? 0.12 : 0;
      return {
        record,
        score: completeness + exactBoost + sourceBoost,
      };
    })
    .filter((entry) => !normalized || entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => ({ ...entry.record, score: Number(entry.score.toFixed(4)) }));

  return {
    query,
    totalMatches: scored.length,
    limit,
    countryCode,
    results: scored,
  };
}

export function datasetProvenance() {
  return (Object.keys(countryMeta) as CountryCode[]).map((code) => ({
    code,
    country: countryMeta[code].country,
    sourceTag: countryMeta[code].sourceTag,
  }));
}
