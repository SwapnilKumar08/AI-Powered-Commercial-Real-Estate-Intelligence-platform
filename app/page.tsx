import Link from "next/link";
import { marketSeries, properties } from "./lib/cre-data";

const features = [
  {
    title: "Evidence-backed research",
    description:
      "Hybrid retrieval links planning, leasing and geospatial data with exact citations so every conclusion is traceable.",
  },
  {
    title: "Market signals in one view",
    description:
      "Track high-conviction opportunities, supply shocks and demand momentum across central London submarkets.",
  },
  {
    title: "Forecasts with spatial memory",
    description:
      "Compare ConvLSTM and PredRNN model outcomes, driver impacts and validation metrics in a single lab.",
  },
  {
    title: "Responsible origination",
    description:
      "Verify contacts, review lawful basis and queue outreach only after compliance and human signoff.",
  },
];

export default function Home() {
  const activeSeries = marketSeries.predrnn;
  const forecastDelta = Math.round(
    ((activeSeries.at(-1)! - activeSeries[0]) / activeSeries[0]) * 100,
  );

  return (
    <main className="landing">
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">Landmark AI</span>
          <h1>Commercial real estate intelligence that keeps pace with the market.</h1>
          <p>
            Explore a dynamic workspace built for evidence-first investment research,
            spatial forecasting and responsible deal origination.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/workspace">
              Launch the workspace
            </Link>
            <Link className="secondary-action" href="/workspace">
              View market preview
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-stat">
            <strong>{properties.length}</strong>
            <span>tracked opportunity assets</span>
          </div>
          <div className="hero-stat">
            <strong>£3.8bn</strong>
            <span>active volume in the last quarter</span>
          </div>
          <div className="hero-stat">
            <strong>+{forecastDelta}%</strong>
            <span>12-month rental forecast change</span>
          </div>
          <div className="hero-highlight">
            <span>Featured asset</span>
            <strong>{properties[0].name}</strong>
            <small>{properties[0].district}</small>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        {features.map((feature) => (
          <article key={feature.title} className="feature-card">
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="property-grid">
        {properties.map((property) => (
          <article key={property.id} className="property-card">
            <span className="property-score">{property.score}</span>
            <h3>{property.name}</h3>
            <p>{property.address}</p>
            <div>
              <strong>{property.capRate}</strong>
              <small>entry yield</small>
            </div>
            <div>
              <strong>{property.occupancy}</strong>
              <small>occupancy</small>
            </div>
          </article>
        ))}
      </section>

      <section className="demo-section">
        <div className="demo-copy">
          <span className="section-kicker">Workspace preview</span>
          <h2>Explore the intelligence workflow in action.</h2>
          <p>
            The same research, forecasting and origination views are available inside the
            interactive Landmark AI workspace.
          </p>
            <Link className="primary-action" href="/workspace">
              Open the workspace
            </Link>
        </div>
        <div className="demo-frame" id="workspace-preview">
          <div className="preview-panel">
            <div className="preview-heading">
              <span>Live workspace</span>
              <strong>Hybrid CRE intelligence</strong>
            </div>
            <div className="preview-stat-grid">
              <div>
                <strong>37</strong>
                <span>high-conviction signals</span>
              </div>
              <div>
                <strong>91%</strong>
                <span>research confidence</span>
              </div>
              <div>
                <strong>+9.1%</strong>
                <span>rental forecast</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
