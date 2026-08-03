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
          <span className="eyebrow">ATLAS NEXUS INTERFACE</span>
          <h1>Global property intelligence, redesigned from the ground up.</h1>
          <p>
            Navigate a new 3D command surface for cross-border real-estate discovery,
            pipeline scoring, and market simulation with country-linked source data.
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
            <small>ATLAS INDEX</small>
            <strong>{globalSearchStats.records}</strong>
            <span>Global records mapped</span>
          </div>
          <div className="core-node node-1">Capital Flows</div>
          <div className="core-node node-2">Pipeline Radar</div>
          <div className="core-node node-3">Permit Pulse</div>
          <div className="core-node node-4">Lease Momentum</div>
          <div className="core-node node-5">Risk Grid</div>
          <div className="core-node node-6">Transit Layer</div>
        </div>
      </section>

      <section className="global-metrics-grid">
        <article>
          <span>Countries covered</span>
          <strong>{globalSearchStats.countries}</strong>
          <small>live market domains</small>
        </article>
        <article>
          <span>Companies indexed</span>
          <strong>{globalSearchStats.companies}</strong>
          <small>entity-matched operators</small>
        </article>
        <article>
          <span>Projects tracked</span>
          <strong>{globalSearchStats.projects}</strong>
          <small>active and planned assets</small>
        </article>
        <article>
          <span>Scenario momentum</span>
          <strong>+{globalForecastDelta}%</strong>
          <small>global weighted forecast trend</small>
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
          <span className="section-kicker">Operational playbooks</span>
          <h3>From acquisitions screening to portfolio defense, in one connected workspace.</h3>
          <p>
            The platform now prioritizes global search velocity, cross-market comparables,
            and explainable forecasting before outreach decisions.
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
