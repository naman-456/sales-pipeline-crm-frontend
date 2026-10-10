import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AppContextValue } from '../interface/AppContext';
import { DEAL_STAGES } from '../interface/types';
import type { DealStage } from '../interface/types';
import Icon from '../components/Icon';
import { crmApi } from '../services/crmApi';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function Pipeline() {
  const { deals, contacts, reload, notify, selectDeal } = useOutletContext<AppContextValue>();
  const [query, setQuery] = useState('');
  const [dragging, setDragging] = useState<string | null>(null);
  const contactById = useMemo(
    () => new Map(contacts.map((contact) => [contact.id, contact])),
    [contacts],
  );
  const filtered = deals.filter((deal) => {
    const contact = contactById.get(deal.contactId);
    const search = `${contact?.name ?? ''} ${contact?.company ?? ''} ${deal.owner}`.toLowerCase();
    return search.includes(query.toLowerCase());
  });

  async function moveDeal(id: string, stage: DealStage) {
    try {
      await crmApi.updateStage(id, stage);
      await reload();
      notify('Deal moved to ' + stage + '.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to move deal.', 'error');
    } finally {
      setDragging(null);
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">SALES WORKSPACE</div>
          <h1>Pipeline</h1>
          <p>Track every opportunity from first touch to close.</p>
        </div>
        <div className="search-control">
          <Icon name="search" />
          <input
            aria-label="Search pipeline"
            placeholder="Search deals..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd>⌘ K</kbd>
        </div>
      </div>
      <div className="pipeline-summary">
        <span>
          <b>{filtered.length}</b> deals
        </span>
        <span className="summary-divider" />
        <span>
          Open value{' '}
          <b>
            {money(
              filtered
                .filter((deal) => !deal.stage.startsWith('Closed'))
                .reduce((sum, deal) => sum + deal.value, 0),
            )}
          </b>
        </span>
        <span className="pipeline-hint">
          <Icon name="columns" size={15} /> Drag a card to move it between stages
        </span>
      </div>
      <div className="pipeline-board">
        {DEAL_STAGES.map((stage) => {
          const items = filtered.filter((deal) => deal.stage === stage);
          const total = items.reduce((sum, deal) => sum + deal.value, 0);
          return (
            <section
              key={stage}
              className={`pipeline-column stage-${stage.toLowerCase().replaceAll(' ', '-')}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dragging && moveDeal(dragging, stage)}
            >
              <header className="column-heading">
                <div>
                  <span className="stage-indicator" />
                  <h2>{stage}</h2>
                  <span className="column-count">{items.length}</span>
                </div>
                <small>{money(total)}</small>
              </header>
              <div className="column-cards">
                {items.map((deal) => {
                  const contact = contactById.get(deal.contactId);
                  return (
                    <article
                      key={deal.id}
                      className={`deal-card ${dragging === deal.id ? 'is-dragging' : ''}`}
                      draggable
                      onDragStart={() => setDragging(deal.id)}
                      onDragEnd={() => setDragging(null)}
                    >
                      <button className="deal-card-main" onClick={() => selectDeal(deal.id)}>
                        <div className="deal-card-top">
                          <span className="company-avatar">
                            {contact?.company.slice(0, 1) ?? 'D'}
                          </span>
                          <span className="deal-card-title">
                            <b>{contact?.company ?? 'Untitled company'}</b>
                            <small>{contact?.name ?? 'No contact'}</small>
                          </span>
                          <span className="card-menu" aria-hidden="true">
                            ···
                          </span>
                        </div>
                        <div className="deal-card-value">{money(deal.value)}</div>
                        <div className="deal-card-tags">
                          {deal.tags.slice(0, 2).map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                        <div className="deal-card-footer">
                          <span
                            className={`score-chip ${deal.score > 65 ? 'score-hot' : deal.score > 38 ? 'score-warm' : 'score-cold'}`}
                          >
                            <span />
                            {deal.score}%
                          </span>
                          <span
                            className={`sentiment-chip sentiment-${deal.sentiment.toLowerCase()}`}
                          >
                            {deal.sentiment === 'Positive'
                              ? '↗'
                              : deal.sentiment === 'Negative'
                                ? '↘'
                                : '–'}{' '}
                            {deal.sentiment}
                          </span>
                          <span className="card-owner">
                            {deal.owner
                              .split(' ')
                              .map((word) => word[0])
                              .join('')}
                          </span>
                        </div>
                      </button>
                    </article>
                  );
                })}
              </div>
              {!items.length && <div className="column-empty">Drop a deal here</div>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
