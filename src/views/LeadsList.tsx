import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AppContextValue } from '../interface/AppContext';
import { DEAL_STAGES } from '../interface/types';
import Icon from '../components/Icon';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function LeadsList() {
  const { deals, contacts, selectDeal } = useOutletContext<AppContextValue>();
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('All stages');
  const [sort, setSort] = useState('recent');
  const contactById = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact])),
    [contacts],
  );
  const filtered = deals
    .filter((deal) => {
      const contact = contactById.get(deal.contactId);
      return (
        `${contact?.name ?? ''} ${contact?.company ?? ''} ${contact?.email ?? ''} ${deal.owner}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (stage === 'All stages' || deal.stage === stage)
      );
    })
    .sort((a, b) =>
      sort === 'value'
        ? b.value - a.value
        : sort === 'score'
          ? b.score - a.score
          : b.createdAt.localeCompare(a.createdAt),
    );

  return (
    <div className="page-content">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">SALES WORKSPACE</div>
          <h1>Deals</h1>
          <p>Every opportunity, all in one place.</p>
        </div>
        <div className="search-control">
          <Icon name="search" />
          <input
            aria-label="Search deals"
            placeholder="Search deals..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div>
            <b>All deals</b>
            <span className="column-count">{filtered.length}</span>
          </div>
          <div className="table-filters">
            <Icon name="filter" size={16} />
            <select
              aria-label="Filter by stage"
              value={stage}
              onChange={(event) => setStage(event.target.value)}
            >
              <option>All stages</option>
              {DEAL_STAGES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              aria-label="Sort deals"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="recent">Most recent</option>
              <option value="value">Highest value</option>
              <option value="score">Highest score</option>
            </select>
          </div>
        </div>
        <div className="table-scroll">
          <table className="crm-table">
            <thead>
              <tr>
                <th>CONTACT</th>
                <th>DEAL VALUE</th>
                <th>STAGE</th>
                <th>LEAD SCORE</th>
                <th>SENTIMENT</th>
                <th>OWNER</th>
                <th>EXPECTED CLOSE</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((deal) => {
                const contact = contactById.get(deal.contactId);
                return (
                  <tr
                    key={deal.id}
                    onClick={() => selectDeal(deal.id)}
                    tabIndex={0}
                    onKeyDown={(event) => event.key === 'Enter' && selectDeal(deal.id)}
                  >
                    <td>
                      <span className="table-contact">
                        <span className="company-avatar">
                          {contact?.company.slice(0, 1) ?? 'D'}
                        </span>
                        <span>
                          <b>{contact?.company ?? 'Untitled company'}</b>
                          <small>
                            {contact?.name ?? 'No contact'} · {contact?.email ?? ''}
                          </small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <b>{money(deal.value)}</b>
                    </td>
                    <td>
                      <span className="stage-badge">{deal.stage}</span>
                    </td>
                    <td>
                      <span
                        className={`score-chip ${deal.score > 65 ? 'score-hot' : deal.score > 38 ? 'score-warm' : 'score-cold'}`}
                      >
                        <span />
                        {deal.score}%
                      </span>
                    </td>
                    <td>
                      <span className={`sentiment-chip sentiment-${deal.sentiment.toLowerCase()}`}>
                        {deal.sentiment}
                      </span>
                    </td>
                    <td>{deal.owner}</td>
                    <td>
                      {new Date(`${deal.expectedClose}T00:00:00`).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <Icon name="chevron" size={16} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!filtered.length && <div className="empty-state">No deals match these filters.</div>}
        <div className="table-footer">
          Showing {filtered.length} of {deals.length} deals <span>Updated just now</span>
        </div>
      </section>
    </div>
  );
}
