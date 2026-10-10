import { useOutletContext } from 'react-router-dom';
import type { AppContextValue } from '../interface/AppContext';
import type { Deal } from '../interface/types';
import Icon from '../components/Icon';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
const openDeals = (deals: Deal[]) => deals.filter((deal) => !deal.stage.startsWith('Closed'));

export default function Dashboard() {
  const { deals, contacts, activities, user, selectDeal } = useOutletContext<AppContextValue>();
  const open = openDeals(deals);
  const pipelineValue = open.reduce((sum, deal) => sum + deal.value, 0);
  const forecast = open.reduce((sum, deal) => sum + (deal.value * deal.score) / 100, 0);
  const won = deals.filter((deal) => deal.stage === 'Closed Won');
  const winRate = deals.filter((deal) => deal.stage.startsWith('Closed')).length
    ? Math.round(
        (won.length / deals.filter((deal) => deal.stage.startsWith('Closed')).length) * 100,
      )
    : 0;
  const risks = open.filter((deal) => deal.sentiment === 'Negative');
  const topDeals = [...open].sort((a, b) => b.value * b.score - a.value * a.score).slice(0, 5);
  const stageCounts = ['Qualified', 'Proposal Sent', 'Negotiation'].map((stage) => ({
    stage,
    deals: open.filter((deal) => deal.stage === stage),
  }));
  const recent = activities.slice(0, 5);
  const contactById = new Map(contacts.map((contact) => [contact.id, contact]));
  const greetingName = user.name.split(' ')[0];
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
    .format(new Date())
    .toUpperCase();

  return (
    <div className="page-content">
      <section className="welcome-row">
        <div>
          <div className="eyebrow">{dateLabel}</div>
          <h1>
            Good morning, {greetingName} <span className="wave">✦</span>
          </h1>
          <p>Here’s what’s happening across your sales pipeline today.</p>
        </div>
        <div className="avatar-stack">
          <span>PS</span>
          <span>KV</span>
          <span>AD</span>
          <small>+2 team members</small>
        </div>
      </section>

      <div className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon lavender">
            <Icon name="columns" />
          </div>
          <span className="stat-label">Open pipeline</span>
          <strong>{money(pipelineValue)}</strong>
          <small>
            <b className="positive">↑ 12.8%</b> vs. last month
          </small>
        </article>
        <article className="stat-card">
          <div className="stat-icon blue">
            <Icon name="trend" />
          </div>
          <span className="stat-label">Weighted forecast</span>
          <strong>{money(forecast)}</strong>
          <small>Based on deal probability</small>
        </article>
        <article className="stat-card">
          <div className="stat-icon mint">
            <Icon name="check" />
          </div>
          <span className="stat-label">Deals won</span>
          <strong>
            {won.length} <small className="muted">this quarter</small>
          </strong>
          <small>
            <b className="positive">{winRate}%</b> win rate
          </small>
        </article>
        <article className="stat-card">
          <div className="stat-icon peach">
            <Icon name="users" />
          </div>
          <span className="stat-label">Active leads</span>
          <strong>{open.length}</strong>
          <small>{contacts.length} contacts in your CRM</small>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="panel forecast-panel">
          <div className="panel-heading">
            <div>
              <h2>Pipeline overview</h2>
              <p>Deal distribution by stage</p>
            </div>
            <button className="text-button">
              This quarter <span>⌄</span>
            </button>
          </div>
          <div className="forecast-total">
            <strong>{money(pipelineValue)}</strong>
            <span className="trend-pill">↗ 12.8%</span>
            <small>total open pipeline</small>
          </div>
          <div className="stage-bars">
            {stageCounts.map(({ stage, deals: stageDeals }) => {
              const value = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
              const width = pipelineValue ? (value / pipelineValue) * 100 : 0;
              return (
                <div className="stage-bar-row" key={stage}>
                  <div className="stage-bar-label">
                    <span>{stage}</span>
                    <span>{money(value)}</span>
                  </div>
                  <div className="stage-bar-track">
                    <div
                      className={`stage-bar-fill ${stage.toLowerCase().replace(' ', '-')}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <small>{stageDeals.length} deals</small>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Latest activity</h2>
              <p>Recent touchpoints with your leads</p>
            </div>
            <button className="round-link" aria-label="View activities">
              <Icon name="arrow" />
            </button>
          </div>
          {recent.length ? (
            <div className="activity-list">
              {recent.map((activity) => {
                const deal = deals.find((item) => item.id === activity.dealId);
                const contact = deal && contactById.get(deal.contactId);
                return (
                  <button
                    className="activity-item"
                    key={activity.id}
                    onClick={() => deal && selectDeal(deal.id)}
                  >
                    <span className={`activity-icon ${activity.type}`}>
                      <Icon
                        name={
                          activity.type === 'call'
                            ? 'phone'
                            : activity.type === 'email'
                              ? 'mail'
                              : 'note'
                        }
                        size={15}
                      />
                    </span>
                    <span className="activity-copy">
                      <b>{activity.title}</b>
                      <small>
                        {contact?.name ?? 'Deal activity'} · {contact?.company ?? ''}
                      </small>
                    </span>
                    <small className="activity-time">
                      {new Date(activity.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </small>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="empty-state">
              No activity logged yet. Open a deal to add a call, email, or note.
            </p>
          )}
        </section>
      </div>

      <div className="dashboard-grid lower-grid">
        <section className="panel deals-panel">
          <div className="panel-heading">
            <div>
              <h2>Deals to watch</h2>
              <p>Your highest-priority opportunities</p>
            </div>
            <span className="soft-badge">{open.length} active</span>
          </div>
          {topDeals.length ? (
            <div className="deal-watch-list">
              {topDeals.map((deal) => {
                const contact = contactById.get(deal.contactId);
                return (
                  <button
                    key={deal.id}
                    className="deal-watch-row"
                    onClick={() => selectDeal(deal.id)}
                  >
                    <span className="company-avatar">{contact?.company.slice(0, 1) ?? 'D'}</span>
                    <span className="deal-watch-name">
                      <b>{contact?.company}</b>
                      <small>
                        {contact?.name} · {deal.stage}
                      </small>
                    </span>
                    <span className="deal-watch-value">
                      <b>{money(deal.value)}</b>
                      <small>{deal.score}% probability</small>
                    </span>
                    <Icon name="chevron" size={16} />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="empty-state">Create a deal to start building your pipeline.</p>
          )}
        </section>
        <section className="panel risk-panel">
          <div className="panel-heading">
            <div>
              <h2>Needs attention</h2>
              <p>AI-assisted signals from your deals</p>
            </div>
            <span className="risk-count">{risks.length}</span>
          </div>
          {risks.length ? (
            risks.slice(0, 3).map((deal) => {
              const contact = contactById.get(deal.contactId);
              return (
                <button className="risk-item" key={deal.id} onClick={() => selectDeal(deal.id)}>
                  <span className="risk-dot" />
                  <span>
                    <b>{contact?.company}</b>
                    <small>Negative sentiment · {deal.stage}</small>
                  </span>
                  <Icon name="chevron" size={16} />
                </button>
              );
            })
          ) : (
            <div className="calm-state">
              <span>✓</span>
              <p>All clear</p>
              <small>No negative sentiment alerts right now.</small>
            </div>
          )}
          <div className="nudge-card">
            <Icon name="sparkles" size={16} />
            <span>
              <b>Smart nudge</b>
              <small>Keep deal activity up to date to improve your forecast.</small>
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
