"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  defaultCountryCode,
  getCountryEvidence,
  getCountryMarketSeries,
  getCountryProfile,
  getCountryProperties,
  listCountryProfiles,
  properties,
  type CountryCode,
  type EvidenceRecord,
  type PropertyRecord,
} from "../lib/cre-data";
import {
  globalCountrySummaries,
  globalSearchStats,
  searchGlobalRealEstate,
} from "../lib/global-real-estate";

type View = "platform" | "radar" | "research" | "forecast" | "origination";
type ForecastModel = "convlstm" | "predrnn";
type AssetFilter = "all" | "office" | "logistics" | "mixed-use";
type Scenario = "base" | "rates" | "supply";
type ContactSource = {
  id: string;
  name: string;
  role: string;
  company: string;
  fit: number;
  email: "Verified" | "Unverified";
  lawfulBasis: string;
  status: "Ready" | "Hold";
};
type ContactState = ContactSource & { queued: boolean };

const navigation: { id: View; label: string; glyph: string }[] = [
  { id: "platform", label: "Global platform", glyph: "◉" },
  { id: "radar", label: "Deal radar", glyph: "⌁" },
  { id: "research", label: "AI research", glyph: "✦" },
  { id: "forecast", label: "Forecast lab", glyph: "⌇" },
  { id: "origination", label: "Origination", glyph: "↗" },
];

const contacts: ContactSource[] = [
  {
    id: "L-21",
    name: "Amelia Hart",
    role: "Investment Director",
    company: "Northbank Capital",
    fit: 93,
    email: "Verified",
    lawfulBasis: "Legitimate interest reviewed",
    status: "Ready",
  },
  {
    id: "L-18",
    name: "Daniel Okafor",
    role: "Head of Acquisitions",
    company: "Urban Axis Partners",
    fit: 89,
    email: "Verified",
    lawfulBasis: "Legitimate interest reviewed",
    status: "Ready",
  },
  {
    id: "L-14",
    name: "Sofia Berg",
    role: "Portfolio Manager",
    company: "Vela Real Assets",
    fit: 84,
    email: "Unverified",
    lawfulBasis: "Review pending",
    status: "Hold",
  },
];

const initialCountryProperties = getCountryProperties(defaultCountryCode);

function lexicalScore(query: string, text: string) {
  const queryTerms = new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  if (!queryTerms.size) return 0;
  const docTerms = new Set(text.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  let overlap = 0;
  for (const term of queryTerms) {
    if (docTerms.has(term)) overlap += 1;
  }
  return overlap / queryTerms.size;
}

function composeLocalAnswer(
  question: string,
  selected: PropertyRecord,
  selectedEvidence: EvidenceRecord[],
) {
  const ranked = selectedEvidence
    .map((evidence) => ({
      evidence,
      score: lexicalScore(question, `${evidence.title} ${evidence.excerpt}`),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map((item) => item.evidence);
  if (!ranked.length) {
    return `${selected.name} currently has limited indexed evidence for this query. Broaden the question to include leasing, planning, location or market momentum.`;
  }
  const lead = ranked[0];
  const support = ranked[1];
  return `${selected.name} is supported by localized evidence. ${lead.excerpt}${
    support ? ` ${support.excerpt}` : ""
  } Review cited records before making an investment decision.`;
}

function Sparkline({
  values,
  color = "#b7f36b",
}: {
  values: number[];
  color?: string;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 38 - ((value - min) / Math.max(1, max - min)) * 31;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 42" role="img" aria-label="Forecast trend">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="0"
        x2="100"
        y1="38"
        y2="38"
        stroke="currentColor"
        opacity=".16"
      />
    </svg>
  );
}

function PropertyMap({
  selected,
  properties,
  labels,
  mapKey,
  onSelect,
}: {
  selected: string;
  properties: PropertyRecord[];
  labels: string[];
  mapKey: string;
  onSelect: (property: PropertyRecord) => void;
}) {
  return (
    <div className="market-map" aria-label="Country opportunity map">
      <div className="river river-one" />
      <div className="river river-two" />
      <div className="district-label district-west">{labels[0] ?? "West"}</div>
      <div className="district-label district-city">{labels[1] ?? "Core"}</div>
      <div className="district-label district-east">{labels[2] ?? "East"}</div>
      <div className="map-orbit orbit-one" />
      <div className="map-orbit orbit-two" />
      {properties.map((property) => (
        <button
          key={property.id}
          className={`map-marker ${selected === property.id ? "active" : ""}`}
          style={{ left: `${property.x}%`, top: `${property.y}%` }}
          onClick={() => onSelect(property)}
          aria-label={`Select ${property.name}`}
        >
          <span>{property.score}</span>
        </button>
      ))}
      <div className="map-key">
        <span className="live-dot" />
        {mapKey}
      </div>
    </div>
  );
}

export function CREWorkspace() {
  const [view, setView] = useState<View>("platform");
  const [countryCode, setCountryCode] = useState<CountryCode>(defaultCountryCode);
  const [selectedId, setSelectedId] = useState(initialCountryProperties[0]?.id ?? properties[0].id);
  const [model, setModel] = useState<ForecastModel>("predrnn");
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");
  const [scenario, setScenario] = useState<Scenario>("base");
  const [globalQuery, setGlobalQuery] = useState("mixed-use projects near transit");
  const [globalScope, setGlobalScope] = useState<CountryCode | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [contactStates, setContactStates] = useState<ContactState[]>(
    contacts.map((contact) => ({ ...contact, queued: false })),
  );
  const [question, setQuestion] = useState(
    "Why is this asset ranked as a high-conviction opportunity?",
  );
  const [answer, setAnswer] = useState(
    "Select a country and ask a market question. Landmark will retrieve the strongest local evidence and summarize the investment signal.",
  );
  const [isThinking, setIsThinking] = useState(false);
  const [toast, setToast] = useState("");
  const countryProfiles = useMemo(() => listCountryProfiles(), []);
  const countryProfile = useMemo(() => getCountryProfile(countryCode), [countryCode]);
  const countryProperties = useMemo(() => getCountryProperties(countryCode), [countryCode]);
  const countryEvidence = useMemo(() => getCountryEvidence(countryCode), [countryCode]);

  const filteredProperties = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return countryProperties.filter((property) => {
      const matchesFilter =
        assetFilter === "all" ||
        (assetFilter === "office" && property.type.toLowerCase().includes("office")) ||
        (assetFilter === "logistics" && property.type.toLowerCase().includes("logistics")) ||
        (assetFilter === "mixed-use" && property.type.toLowerCase().includes("mixed"));
      const matchesSearch =
        !normalizedSearch ||
        [
          property.name,
          property.address,
          property.district,
          property.type,
          property.signal,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch) ||
        countryEvidence.some(
          (evidence) =>
            evidence.propertyId === property.id &&
            evidence.excerpt.toLowerCase().includes(normalizedSearch),
        );
      return matchesFilter && matchesSearch;
    });
  }, [assetFilter, countryEvidence, countryProperties, searchTerm]);

  useEffect(() => {
    if (
      filteredProperties.length > 0 &&
      !filteredProperties.some((property) => property.id === selectedId)
    ) {
      setSelectedId(filteredProperties[0].id);
    }
  }, [filteredProperties, selectedId]);

  useEffect(() => {
    if (countryProperties.length > 0) {
      setSelectedId(countryProperties[0].id);
    }
  }, [countryCode, countryProperties]);

  const selected =
    filteredProperties.find((property) => property.id === selectedId) ??
    countryProperties.find((property) => property.id === selectedId) ??
    countryProperties[0] ??
    properties[0];
  const selectedEvidence = countryEvidence.filter(
    (evidence) => evidence.propertyId === selected.id,
  );
  const series = useMemo(
    () => getCountryMarketSeries(countryCode, model),
    [countryCode, model],
  );

  const scenarioSeries = useMemo(() => {
    const modifier = scenario === "rates" ? 1.12 : scenario === "supply" ? 0.94 : 1;
    return series.map((value) => Math.round(value * modifier));
  }, [series, scenario]);

  const forecastDelta = useMemo(
    () => Math.round(((scenarioSeries.at(-1)! - scenarioSeries[0]) / scenarioSeries[0]) * 100),
    [scenarioSeries],
  );
  const regionalVolume = useMemo(
    () => `$${(countryProfile.companyCount * 0.052).toFixed(2)}bn`,
    [countryProfile.companyCount],
  );
  const highConvictionSignals = useMemo(
    () => Math.max(10, Math.round(countryProfile.companyCount * 0.42)),
    [countryProfile.companyCount],
  );
  const freshSignalCount = useMemo(
    () => Math.max(2, Math.round(countryProfile.projectCount / 3)),
    [countryProfile.projectCount],
  );
  const mapLabels = useMemo(() => {
    const unique = Array.from(new Set(countryProperties.map((property) => property.district)));
    return [unique[0], unique[1], unique[2]].filter(Boolean) as string[];
  }, [countryProperties]);
  const globalCompanyCount = globalSearchStats.companies;
  const globalProjectCount = globalSearchStats.projects;
  const globalExpertiseCount = useMemo(
    () => countryProfiles.reduce((sum, profile) => sum + profile.expertiseCount, 0),
    [countryProfiles],
  );
  const globalForecastDelta = useMemo(() => {
    const deltas = countryProfiles.map((profile) => {
      const line = getCountryMarketSeries(profile.code, model);
      return ((line.at(-1)! - line[0]) / line[0]) * 100;
    });
    const average = deltas.reduce((sum, value) => sum + value, 0) / Math.max(1, deltas.length);
    return Math.round(average);
  }, [countryProfiles, model]);
  const topCountries = useMemo(
    () => [...countryProfiles].sort((left, right) => right.companyCount - left.companyCount),
    [countryProfiles],
  );
  const globalSearchResult = useMemo(
    () => searchGlobalRealEstate(globalQuery, { countryCode: globalScope, limit: 6 }),
    [globalQuery, globalScope],
  );

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function queueReadyContacts() {
    const queueable = contactStates.filter((contact) => contact.status === "Ready" && !contact.queued);
    if (queueable.length === 0) {
      notify("No additional ready contacts available for queue.");
      return;
    }
    setContactStates((current) =>
      current.map((contact) =>
        contact.status === "Ready" ? { ...contact, queued: true } : contact,
      ),
    );
    notify(`${queueable.length} compliant contacts added to review queue`);
  }

  function toggleContactQueue(contactId: string) {
    const contact = contactStates.find((item) => item.id === contactId);
    if (!contact) return;

    if (contact.status === "Ready") {
      if (contact.queued) {
        notify(`${contact.name} is already queued for review`);
        return;
      }
      setContactStates((current) =>
        current.map((item) =>
          item.id === contactId ? { ...item, queued: true } : item,
        ),
      );
      notify(`${contact.name} added for human approval`);
      return;
    }

    notify("Contact held until verification and lawful-basis review");
  }

  async function askResearch(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setIsThinking(true);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, propertyId: selected.id, countryCode }),
      });
      if (response.ok) {
        const payload = (await response.json()) as { answer?: string };
        setAnswer(payload.answer ?? composeLocalAnswer(question, selected, selectedEvidence));
      } else {
        setAnswer(composeLocalAnswer(question, selected, selectedEvidence));
      }
    } catch {
      setAnswer(composeLocalAnswer(question, selected, selectedEvidence));
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <main className="workspace">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">L</span>
          <span>Landmark-AI-Data-Search</span>
        </div>
        <nav aria-label="Workspace navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => setView(item.id)}
            >
              <span aria-hidden="true">{item.glyph}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="pipeline-status">
            <span className="live-dot" />
            Data pipeline healthy
          </div>
          <div className="profile">
            <span>MO</span>
            <div>
              <strong>Maya Okafor</strong>
              <small>Investment strategy</small>
            </div>
          </div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Global intelligence network · {countryProfile.name} focus</p>
            <h1>
              {view === "platform" && "A connected global real-estate platform."}
              {view === "radar" && "See the market before it moves."}
              {view === "research" && "Research that shows its work."}
              {view === "forecast" && "Model tomorrow’s market."}
              {view === "origination" && "Turn signals into conversations."}
            </h1>
          </div>
          <div className="top-actions">
            <label className="country-select">
              <span>Country</span>
              <select
                aria-label="Select market country"
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value as CountryCode)}
              >
                {countryProfiles.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="global-search">
              <span>⌕</span>
              <input
                aria-label="Search properties, companies and documents"
                placeholder="Search assets, owners, evidence…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button" aria-label="Notifications">
              ◌
              <span className="notification-dot" />
            </button>
          </div>
        </header>

        {view === "platform" && (
          <div className="platform-layout">
            <section className="platform-cosmos">
              <div className="cosmos-title">
                <span className="section-kicker">Propeterra-inspired interface</span>
                <h2>Global command sphere</h2>
                <p>
                  Unified geospatial apps, transaction intelligence and market analytics
                  connected to country-level real-estate datasets.
                </p>
              </div>

              <div className="cosmos-core">
                <div className="tool-column left">
                  <span className="column-label">Geo spatial apps</span>
                  {topCountries.slice(0, 3).map((profile) => (
                    <button
                      key={profile.code}
                      className={`tool-node ${countryCode === profile.code ? "active" : ""}`}
                      onClick={() => setCountryCode(profile.code)}
                    >
                      <strong>{profile.name}</strong>
                      <small>{profile.companyCount} firms</small>
                    </button>
                  ))}
                </div>

                <div className="planetary-core" aria-label="Global platform intelligence graph">
                  <div className="glow-ring ring-one" />
                  <div className="glow-ring ring-two" />
                  <div className="planet-center">
                    <small>PROPETERRA GLOBAL</small>
                    <strong>{globalCompanyCount.toLocaleString()}</strong>
                    <span>Companies indexed</span>
                  </div>
                  <div className="orbit-country-grid">
                    {countryProfiles.map((profile) => (
                      <button
                        key={profile.code}
                        className={`orbit-country ${countryCode === profile.code ? "active" : ""}`}
                        onClick={() => setCountryCode(profile.code)}
                        aria-label={`Focus ${profile.name}`}
                      >
                        <b>{profile.code}</b>
                        <span>{profile.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tool-column right">
                  <span className="column-label">Data analytics</span>
                  {topCountries.slice(3).map((profile) => (
                    <button
                      key={profile.code}
                      className={`tool-node ${countryCode === profile.code ? "active" : ""}`}
                      onClick={() => setCountryCode(profile.code)}
                    >
                      <strong>{profile.name}</strong>
                      <small>{profile.projectCount} projects</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="resource-clusters">
                {[
                  ["Frontier markets", "High-upside early cycle regions"],
                  ["Emerging markets", "Demand-led urbanization corridors"],
                  ["Developed markets", "Stabilized institutional districts"],
                  ["Social impact", "Housing and mixed-use inclusion themes"],
                ].map(([label, description]) => (
                  <article key={label}>
                    <span>{label}</span>
                    <small>{description}</small>
                  </article>
                ))}
              </div>
            </section>

            <aside className="platform-insights">
              <div className="insight-card">
                <span>Country coverage</span>
                <strong>{globalSearchStats.countries}</strong>
                <small>active market datasets</small>
              </div>
              <div className="insight-card">
                <span>Projects mapped</span>
                <strong>{globalProjectCount}</strong>
                <small>structured project records</small>
              </div>
              <div className="insight-card">
                <span>Expertise vectors</span>
                <strong>{globalExpertiseCount}</strong>
                <small>cross-market capability tags</small>
              </div>
              <div className="insight-card highlight">
                <span>Composite forecast</span>
                <strong>+{globalForecastDelta}%</strong>
                <small>{model === "predrnn" ? "PredRNN" : "ConvLSTM"} global mean horizon</small>
              </div>
              <div className="global-search-panel">
                <span className="section-kicker">Global data search</span>
                <label>
                  <input
                    value={globalQuery}
                    onChange={(event) => setGlobalQuery(event.target.value)}
                    placeholder="Search companies, projects, locations"
                    aria-label="Search global real estate data"
                  />
                </label>
                <label>
                  <select
                    value={globalScope}
                    onChange={(event) => setGlobalScope(event.target.value as CountryCode | "ALL")}
                    aria-label="Filter global search by country"
                  >
                    <option value="ALL">All countries</option>
                    {globalCountrySummaries.map((summary) => (
                      <option key={summary.code} value={summary.code}>
                        {summary.country}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="search-result-list">
                  {globalSearchResult.results.length === 0 && (
                    <small>No records found for this query.</small>
                  )}
                  {globalSearchResult.results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => setCountryCode(result.countryCode)}
                    >
                      <strong>{result.propertyName}</strong>
                      <span>{result.country} · {result.companyName}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="workspace-jumps">
                <button onClick={() => setView("radar")}>Open deal radar</button>
                <button onClick={() => setView("research")}>Open AI research</button>
                <button onClick={() => setView("forecast")}>Open forecast lab</button>
              </div>
            </aside>
          </div>
        )}

        {view === "radar" && (
          <div className="view-grid radar-view">
            <section className="hero-map">
              <div className="map-heading">
                <div>
                  <span className="section-kicker">Opportunity intelligence</span>
                  <h2>Conviction map</h2>
                </div>
                <div className="filter-row">
                  {([
                    ["all", "All assets"],
                    ["office", "Office"],
                    ["logistics", "Logistics"],
                    ["mixed-use", "Mixed-use"],
                  ] as [AssetFilter, string][]).map(([filterId, label]) => (
                    <button
                      key={filterId}
                      className={`filter ${assetFilter === filterId ? "active" : ""}`}
                      onClick={() => setAssetFilter(filterId)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <PropertyMap
                selected={selected.id}
                properties={filteredProperties.length ? filteredProperties : countryProperties}
                labels={mapLabels}
                mapKey={`${countryProfile.companyCount.toLocaleString()} tracked companies · refreshed 4 min ago`}
                onSelect={(property) => setSelectedId(property.id)}
              />
            </section>

            <aside className="signal-panel">
              <div className="score-ring">
                <span>{selected.score}</span>
                <small>AI opportunity score</small>
              </div>
              <span className="signal-tag">Emerging signal</span>
              <h2>{selected.name}</h2>
              <p className="address">{selected.address} · {selected.district}</p>
              <p className="signal-copy">
                {selected.signal} is strengthening across public registry,
                company-footprint and market-activity evidence. The model
                identifies a {68 + Math.round(countryProfile.momentumBias * 140)}% probability of
                above-market NOI growth.
              </p>
              <dl className="asset-metrics">
                <div><dt>Guide price</dt><dd>{selected.price}</dd></div>
                <div><dt>Entry yield</dt><dd>{selected.capRate}</dd></div>
                <div><dt>Occupancy</dt><dd>{selected.occupancy}</dd></div>
                <div><dt>Evidence</dt><dd>{selectedEvidence.length || 2} sources</dd></div>
              </dl>
              <button className="primary-action" onClick={() => setView("research")}>
                Open investment brief <span>↗</span>
              </button>
            </aside>

            <section className="market-strip">
              <article>
                <span>Tracked investment volume</span>
                <strong>{regionalVolume}</strong>
                <small className="positive">↑ {Math.max(2.1, (forecastDelta / 2)).toFixed(1)}% quarter on quarter</small>
              </article>
              <article>
                <span>High-conviction signals</span>
                <strong>{highConvictionSignals}</strong>
                <small>{freshSignalCount} new in the last seven days</small>
              </article>
              <article>
                <span>Prime office rent forecast</span>
                <strong>+{forecastDelta}%</strong>
                <small>{model === "predrnn" ? "PredRNN" : "ConvLSTM"} · 12-month horizon</small>
              </article>
              <article className="mini-chart">
                <span>Composite market momentum</span>
                <Sparkline values={[88, 91, 89, 94, 96, 101, 105, 108]} />
              </article>
            </section>
          </div>
        )}

        {view === "research" && (
          <div className="research-layout">
            <section className="research-main">
              <div className="research-context">
                <span className="section-kicker">Hybrid RAG workspace</span>
                <div className="property-context">
                  <div>
                    <h2>{selected.name}</h2>
                    <p>{selected.address} · {selected.type}</p>
                  </div>
                  <select
                    aria-label="Selected property"
                    value={selected.id}
                    onChange={(event) => setSelectedId(event.target.value)}
                  >
                    {countryProperties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="answer-card">
                <div className="answer-head">
                  <span className="ai-orb">✦</span>
                  <div>
                    <strong>Landmark-AI-Data-Search research agent</strong>
                    <small>Vector retrieval + property knowledge graph</small>
                  </div>
                  <span className="confidence">91% confidence</span>
                </div>
                <p className={isThinking ? "thinking" : ""}>
                  {isThinking ? "Retrieving evidence and traversing relationships…" : answer}
                </p>
                <div className="citation-pills">
                  {(selectedEvidence.length ? selectedEvidence : countryEvidence.slice(0, 2)).map(
                    (evidence, index) => (
                      <button key={evidence.id}>[{index + 1}] {evidence.source}</button>
                    ),
                  )}
                </div>
              </div>
              <form className="ask-bar" onSubmit={askResearch}>
                <textarea
                  aria-label="Ask a property research question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={2}
                />
                <div>
                  <span>Answers are constrained to indexed evidence</span>
                  <button type="submit" disabled={isThinking}>
                    Ask Landmark-AI-Data-Search <span>↑</span>
                  </button>
                </div>
              </form>
              <div className="research-suggestions">
                <button onClick={() => setQuestion("What are the principal planning risks?")}>
                  Planning risks
                </button>
                <button onClick={() => setQuestion("Which leases create near-term income risk?")}>
                  Lease events
                </button>
                <button onClick={() => setQuestion("Compare this asset with local transactions.")}>
                  Comparable evidence
                </button>
              </div>
            </section>

            <aside className="evidence-drawer">
              <div className="drawer-head">
                <div>
                  <span className="section-kicker">Traceable evidence</span>
                  <h3>Source ledger</h3>
                </div>
                <span>{selectedEvidence.length || 2}</span>
              </div>
              {(selectedEvidence.length ? selectedEvidence : countryEvidence.slice(0, 2)).map(
                (evidence, index) => (
                  <article key={evidence.id}>
                    <div className="source-index">{index + 1}</div>
                    <div>
                      <strong>{evidence.title}</strong>
                      <small>{evidence.locator}</small>
                      <p>{evidence.excerpt}</p>
                      <code>{evidence.hash}</code>
                    </div>
                  </article>
                ),
              )}
              <div className="graph-preview">
                <span className="section-kicker">Relationship path</span>
                <div className="graph-line">
                  <span>{selected.name}</span><i />
                  <span>{selected.signal}</span><i />
                  <span>NOI growth</span>
                </div>
                <small>2 hops · 0.88 relationship confidence</small>
              </div>
            </aside>
          </div>
        )}

        {view === "forecast" && (
          <div className="forecast-layout">
            <section className="forecast-hero">
              <div className="forecast-head">
                <div>
                  <span className="section-kicker">Spatiotemporal prediction</span>
                  <h2>{countryProfile.name} rental momentum</h2>
                  <p>Quarterly prime-rent index · 12-month horizon</p>
                </div>
                <div className="model-switch" role="group" aria-label="Forecast model">
                  <button
                    className={model === "convlstm" ? "active" : ""}
                    onClick={() => setModel("convlstm")}
                  >
                    ConvLSTM
                  </button>
                  <button
                    className={model === "predrnn" ? "active" : ""}
                    onClick={() => setModel("predrnn")}
                  >
                    PredRNN
                  </button>
                </div>
              </div>
              <div className="large-chart">
                <div className="chart-value">
                  <span>Forecast movement</span>
                  <strong>+{forecastDelta}%</strong>
                  <small>90% interval: +{forecastDelta - 7}% to +{forecastDelta + 8}%</small>
                </div>
                <Sparkline values={scenarioSeries} />
                <div className="chart-axis">
                  <span>Jul ’25</span><span>Jan ’26</span><span>Jul ’26</span><span>Jul ’27</span>
                </div>
              </div>
              <p className="model-note">
                {model === "predrnn"
                  ? "PredRNN retains spatial memory across planning, mobility, take-up and supply grids. Stronger on the 12-month validation window."
                  : "ConvLSTM models local spatial dependencies with a lower-latency recurrent stack. Preferred for rapid scenario screening."}
              </p>
            </section>

            <aside className="drivers-panel">
              <span className="section-kicker">Model drivers</span>
              <h3>What is moving the forecast</h3>
              {[
                ["Laboratory take-up", "+8.4", 88],
                ["Planning intensity", "+6.1", 71],
                ["Rail footfall", "+4.7", 62],
                ["New supply", "−3.2", 41],
              ].map(([label, value, width]) => (
                <div className="driver" key={label}>
                  <div><span>{label}</span><strong>{value}</strong></div>
                  <i><b style={{ width: `${width}%` }} /></i>
                </div>
              ))}
              <div className="validation-box">
                <strong>Validation snapshot</strong>
                <div><span>MAE</span><b>{model === "predrnn" ? "3.8%" : "4.6%"}</b></div>
                <div><span>Spatial SSIM</span><b>{model === "predrnn" ? "0.91" : "0.86"}</b></div>
                <div><span>Drift status</span><b className="positive">Within bounds</b></div>
              </div>
            </aside>

            <section className="scenario-row">
              {([
                ["base", "Base case", "+9.1%", "Current rates and planned supply"],
                ["rates", "Rates ease 75 bps", "+14.8%", "Capital-market recovery accelerates"],
                ["supply", "Supply shock", "+3.4%", "Two schemes complete six months early"],
              ] as [Scenario, string, string, string][]).map(
                ([scenarioId, name, value, description]) => (
                  <button
                    key={scenarioId}
                    className={scenario === scenarioId ? "active" : ""}
                    onClick={() => setScenario(scenarioId)}
                  >
                    <span>{name}</span>
                    <strong>{value}</strong>
                    <small>{description}</small>
                  </button>
                ),
              )}
            </section>
          </div>
        )}

        {view === "origination" && (
          <div className="origination-layout">
            <section className="origination-head">
              <div>
                <span className="section-kicker">Responsible outreach</span>
                <h2>Buyer and partner fit</h2>
                <p>
                  Entity resolution links investment mandates, prior transactions
                  and verified professional contact data.
                </p>
              </div>
              <button className="primary-action" onClick={queueReadyContacts}>
                Create review queue <span>↗</span>
              </button>
            </section>
            <section className="contact-table">
              <div className="table-header">
                <span>Contact</span><span>Mandate fit</span><span>Email</span>
                <span>Lawful basis</span><span>Decision</span>
              </div>
              {contactStates.map((contact) => (
                <div className="contact-row" key={contact.id}>
                  <div className="contact-name">
                    <span>{contact.name.split(" ").map((part) => part[0]).join("")}</span>
                    <div><strong>{contact.name}</strong><small>{contact.role} · {contact.company}</small></div>
                  </div>
                  <div className="fit-score"><b>{contact.fit}</b><i><em style={{ width: `${contact.fit}%` }} /></i></div>
                  <span className={contact.email === "Verified" ? "status good" : "status wait"}>
                    {contact.email}
                  </span>
                  <small>{contact.lawfulBasis}</small>
                  <button
                    className={`decision ${contact.status === "Ready" ? "ready" : ""}`}
                    onClick={() => toggleContactQueue(contact.id)}
                  >
                    {contact.queued ? "Queued" : contact.status}
                  </button>
                </div>
              ))}
            </section>
            <div className="governance-note">
              <span>✓</span>
              <div>
                <strong>Human approval is required before any message is sent.</strong>
                <p>
                  Suppression, consent, verification and frequency checks run
                  before queueing. LinkedIn data is limited to authorised APIs
                  and user-provided exports.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

