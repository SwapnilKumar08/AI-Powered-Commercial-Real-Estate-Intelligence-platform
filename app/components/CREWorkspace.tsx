"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  evidenceCorpus,
  marketSeries,
  properties,
  type PropertyRecord,
} from "../lib/cre-data";

type View = "radar" | "research" | "forecast" | "origination";
type ForecastModel = "convlstm" | "predrnn";

const navigation: { id: View; label: string; glyph: string }[] = [
  { id: "radar", label: "Deal radar", glyph: "⌁" },
  { id: "research", label: "AI research", glyph: "✦" },
  { id: "forecast", label: "Forecast lab", glyph: "⌇" },
  { id: "origination", label: "Origination", glyph: "↗" },
];

const contacts = [
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
  onSelect,
}: {
  selected: string;
  onSelect: (property: PropertyRecord) => void;
}) {
  return (
    <div className="market-map" aria-label="London opportunity map">
      <div className="river river-one" />
      <div className="river river-two" />
      <div className="district-label district-west">West End</div>
      <div className="district-label district-city">City Core</div>
      <div className="district-label district-east">Stratford</div>
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
        34,218 assets · refreshed 4 min ago
      </div>
    </div>
  );
}

export function CREWorkspace() {
  const [view, setView] = useState<View>("radar");
  const [selectedId, setSelectedId] = useState(properties[0].id);
  const [model, setModel] = useState<ForecastModel>("predrnn");
  const [question, setQuestion] = useState(
    "Why is The Arches ranked as a high-conviction opportunity?",
  );
  const [answer, setAnswer] = useState(
    "The Arches combines a 5.8% entry yield with a credible laboratory-conversion pathway. Planning evidence supports lab-enabled employment space, while local availability remains constrained and fitted laboratory rents are up 7.2% year on year.",
  );
  const [isThinking, setIsThinking] = useState(false);
  const [toast, setToast] = useState("");
  const selected =
    properties.find((property) => property.id === selectedId) ?? properties[0];
  const selectedEvidence = evidenceCorpus.filter(
    (evidence) => evidence.propertyId === selected.id,
  );
  const series = marketSeries[model];

  const forecastDelta = useMemo(
    () => Math.round(((series.at(-1)! - series[0]) / series[0]) * 100),
    [series],
  );

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  async function askResearch(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setIsThinking(true);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, propertyId: selected.id }),
      });
      if (response.ok) {
        const payload = (await response.json()) as { answer: string };
        setAnswer(payload.answer);
      } else {
        setAnswer(
          "The retrieved evidence indicates planning support for laboratory-enabled employment space and constrained local supply. Review the cited passages before making an investment decision.",
        );
      }
    } catch {
      setAnswer(
        "The retrieved evidence indicates planning support for laboratory-enabled employment space and constrained local supply. Review the cited passages before making an investment decision.",
      );
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <main className="workspace">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">L</span>
          <span>Landmark <strong>AI</strong></span>
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
            <p className="eyebrow">London · Commercial real estate</p>
            <h1>
              {view === "radar" && "See the market before it moves."}
              {view === "research" && "Research that shows its work."}
              {view === "forecast" && "Model tomorrow’s market."}
              {view === "origination" && "Turn signals into conversations."}
            </h1>
          </div>
          <div className="top-actions">
            <label className="global-search">
              <span>⌕</span>
              <input
                aria-label="Search properties, companies and documents"
                placeholder="Search assets, owners, evidence…"
              />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button" aria-label="Notifications">
              ◌
              <span className="notification-dot" />
            </button>
          </div>
        </header>

        {view === "radar" && (
          <div className="view-grid radar-view">
            <section className="hero-map">
              <div className="map-heading">
                <div>
                  <span className="section-kicker">Opportunity intelligence</span>
                  <h2>Conviction map</h2>
                </div>
                <div className="filter-row">
                  <button className="filter active">All assets</button>
                  <button className="filter">Office</button>
                  <button className="filter">Logistics</button>
                  <button className="filter">Mixed-use</button>
                </div>
              </div>
              <PropertyMap
                selected={selected.id}
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
                {selected.signal} is strengthening across planning, leasing and
                mobility evidence. The model identifies a 71% probability of
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
                <strong>£3.84bn</strong>
                <small className="positive">↑ 12.6% quarter on quarter</small>
              </article>
              <article>
                <span>High-conviction signals</span>
                <strong>37</strong>
                <small>8 new in the last seven days</small>
              </article>
              <article>
                <span>Prime office rent forecast</span>
                <strong>+9.1%</strong>
                <small>PredRNN · 12-month horizon</small>
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
                    {properties.map((property) => (
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
                    <strong>Landmark research agent</strong>
                    <small>Vector retrieval + property knowledge graph</small>
                  </div>
                  <span className="confidence">91% confidence</span>
                </div>
                <p className={isThinking ? "thinking" : ""}>
                  {isThinking ? "Retrieving evidence and traversing relationships…" : answer}
                </p>
                <div className="citation-pills">
                  {(selectedEvidence.length ? selectedEvidence : evidenceCorpus.slice(0, 2)).map(
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
                    Ask Landmark <span>↑</span>
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
              {(selectedEvidence.length ? selectedEvidence : evidenceCorpus.slice(0, 2)).map(
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
                  <h2>King’s Cross rental momentum</h2>
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
                <Sparkline values={series} />
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
              {[
                ["Base case", "+9.1%", "Current rates and planned supply"],
                ["Rates ease 75 bps", "+14.8%", "Capital-market recovery accelerates"],
                ["Supply shock", "+3.4%", "Two schemes complete six months early"],
              ].map(([name, value, description], index) => (
                <button className={index === 0 ? "active" : ""} key={name}>
                  <span>{name}</span><strong>{value}</strong><small>{description}</small>
                </button>
              ))}
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
              <button
                className="primary-action"
                onClick={() => notify("2 compliant contacts added to review queue")}
              >
                Create review queue <span>↗</span>
              </button>
            </section>
            <section className="contact-table">
              <div className="table-header">
                <span>Contact</span><span>Mandate fit</span><span>Email</span>
                <span>Lawful basis</span><span>Decision</span>
              </div>
              {contacts.map((contact) => (
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
                    onClick={() =>
                      notify(
                        contact.status === "Ready"
                          ? `${contact.name} added for human approval`
                          : "Contact held until verification and lawful-basis review",
                      )
                    }
                  >
                    {contact.status}
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

