import Link from "next/link";
import { getCountryMarketSeries, listCountryProfiles } from "./lib/cre-data";
import { globalCountrySummaries, globalSearchStats } from "./lib/global-real-estate";

export default function Home() {
  const profiles = listCountryProfiles();
  const globalForecastDelta = Math.round(
    profiles
      .map((profile) => {
        const series = getCountryMarketSeries(profile.code, "predrnn");
        return ((series.at(-1)! - series[0]) / series[0]) * 100;
      })
      .reduce((sum, value) => sum + value, 0) / Math.max(1, profiles.length),
  );

  return (
    <main className="global-landing">
      <section className="global-hero-3d">
        <div className="global-hero-copy">
          <span className="eyebrow">PROPETERRA GLOBAL INTERFACE</span>
          <h1>3D real-estate intelligence across global markets.</h1>
          <p>
            Explore worldwide company and project records, run country-aware forecasts,
            and move from discovery to deal origination in a single immersive workspace.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/workspace">
              Launch 3D workspace
            </Link>
            <Link className="secondary-action" href="/workspace">
              Open global data search
            </Link>
          </div>
        </div>

        <div className="global-core-scene">
          <div className="core-orbit orbit-a" />
          <div className="core-orbit orbit-b" />
          <div className="core-planet">
            <small>LIVE INDEX</small>
            <strong>{globalSearchStats.records}</strong>
            <span>Global property records</span>
          </div>
          <div className="core-node node-1">Consultelligence</div>
          <div className="core-node node-2">Deal Planet</div>
          <div className="core-node node-3">Heat Vision</div>
          <div className="core-node node-4">Dashtelligence</div>
          <div className="core-node node-5">Property News</div>
          <div className="core-node node-6">Geo Spatial Apps</div>
        </div>
      </section>

      <section className="global-metrics-grid">
        <article>
          <span>Countries covered</span>
          <strong>{globalSearchStats.countries}</strong>
          <small>active market datasets</small>
        </article>
        <article>
          <span>Companies indexed</span>
          <strong>{globalSearchStats.companies}</strong>
          <small>normalized from source files</small>
        </article>
        <article>
          <span>Projects tracked</span>
          <strong>{globalSearchStats.projects}</strong>
          <small>deep records and developments</small>
        </article>
        <article>
          <span>Forecast momentum</span>
          <strong>+{globalForecastDelta}%</strong>
          <small>PredRNN global average horizon</small>
        </article>
      </section>

      <section className="global-country-grid">
        {globalCountrySummaries.map((summary) => (
          <article key={summary.code}>
            <h2>{summary.country}</h2>
            <p>{summary.companies} companies indexed</p>
            <div>
              <strong>{summary.projects}</strong>
              <small>project-level records</small>
            </div>
          </article>
        ))}
      </section>

      <section className="global-cta-strip">
        <div>
          <span className="section-kicker">Resource centres</span>
          <h3>Frontier, emerging, developed and impact-led investment workflows.</h3>
          <p>
            The workspace includes global search, traceable evidence, forecast lab and
            responsible origination controls.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="primary-action" href="/workspace">
            Enter workspace
          </Link>
          <Link className="secondary-action" href="/workspace">
            Start market discovery
          </Link>
        </div>
      </section>
    </main>
  );
}
