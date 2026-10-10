import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { Activity, Deal, DealStage, Contact, LeadAnalysis } from '../interface/types';
import { DEAL_STAGES } from '../interface/types';
import { crmApi } from '../services/crmApi';
import Icon from './Icon';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

interface ActivityFormValues {
  rawText: string;
}

interface TranscriptFormValues {
  text: string;
}

export default function DealDetails({
  deal,
  contact,
  activities,
  onClose,
  reload,
  notify,
}: {
  deal?: Deal;
  contact?: Contact;
  activities: Activity[];
  onClose: () => void;
  reload: () => Promise<void>;
  notify: (message: string, kind?: 'success' | 'error') => void;
}) {
  const [activityType, setActivityType] = useState<'call' | 'email' | 'note'>('note');
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [scoreResult, setScoreResult] = useState<LeadAnalysis>();
  const [draft, setDraft] = useState<{ subject: string; body: string }>();
  const [sentimentResult, setSentimentResult] = useState<string>();
  const activityForm = useForm<ActivityFormValues>({ defaultValues: { rawText: '' } });
  const transcriptForm = useForm<TranscriptFormValues>({ defaultValues: { text: '' } });
  const note = useWatch({ control: activityForm.control, name: 'rawText' });
  const transcriptValue = useWatch({ control: transcriptForm.control, name: 'text' });
  const timeline = useMemo(
    () =>
      activities
        .filter((activity) => activity.dealId === deal?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [activities, deal?.id],
  );

  if (!deal || !contact) return null;
  const currentDeal = deal;

  async function handleStageChange(stage: DealStage) {
    setBusy(true);
    try {
      await crmApi.updateStage(currentDeal.id, stage);
      await reload();
      notify(`Deal moved to ${stage}.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to update the deal.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function logActivity(values: ActivityFormValues) {
    setBusy(true);
    try {
      await crmApi.createActivity({
        dealId: currentDeal.id,
        type: activityType,
        title:
          activityType === 'note'
            ? 'Note added'
            : `${activityType[0].toUpperCase()}${activityType.slice(1)} logged`,
        rawText: values.rawText.trim(),
      });
      activityForm.reset();
      await reload();
      notify('Activity added to the deal.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to add activity.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function summarize(values: TranscriptFormValues) {
    setBusy(true);
    try {
      const result = await crmApi.summarize(values.text);
      setSummary(result.summary);
      setActionItems(result.actionItems);
      await crmApi.createActivity({
        dealId: currentDeal.id,
        type: 'call',
        title: 'Transcript summarized',
        rawText: values.text,
        summary: result.summary,
        actionItems: result.actionItems,
        entities: result.entities,
      });
      transcriptForm.reset();
      await reload();
      notify('Summary saved to the timeline.');
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Unable to summarize this transcript.',
        'error',
      );
    } finally {
      setBusy(false);
    }
  }

  async function analyzeSentiment() {
    const latestText = timeline[0]?.rawText;
    if (!latestText) {
      notify('Log an activity first so there is communication to analyze.', 'error');
      return;
    }
    setBusy(true);
    try {
      const result = await crmApi.analyzeSentiment(latestText);
      setSentimentResult(`${result.label} · ${result.score}/100`);
      notify(`Latest activity sentiment: ${result.label}.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to analyze sentiment.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function scoreLead() {
    const text = timeline
      .slice(0, 5)
      .map((activity) => activity.rawText)
      .filter(Boolean)
      .join('\n');
    if (!text) {
      notify('Log an activity first so there is communication to score.', 'error');
      return;
    }
    setBusy(true);
    try {
      setScoreResult(await crmApi.scoreLead(text));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to score this lead.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function createDraft() {
    setBusy(true);
    try {
      setDraft(await crmApi.draftEmail(currentDeal.id));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to draft a follow-up.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="drawer-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <aside
        className="deal-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-drawer-title"
      >
        <header className="drawer-header">
          <div>
            <span className="eyebrow">DEAL DETAILS</span>
            <div className="drawer-company">
              <span className="company-avatar">{contact.company.slice(0, 1)}</span>
              <h2 id="deal-drawer-title">{contact.company}</h2>
            </div>
          </div>
          <button className="icon-button" aria-label="Close details" onClick={onClose}>
            <Icon name="close" />
          </button>
        </header>
        <div className="drawer-scroll">
          <div className="deal-contact-line">
            <span>{contact.name}</span>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
          <div className="drawer-value-row">
            <div>
              <small>DEAL VALUE</small>
              <strong>{money(deal.value)}</strong>
            </div>
            <span
              className={`score-chip ${deal.score > 65 ? 'score-hot' : deal.score > 38 ? 'score-warm' : 'score-cold'}`}
            >
              <span />
              {deal.score}% score
            </span>
          </div>
          <div className="detail-grid">
            <div>
              <small>OWNER</small>
              <b>{deal.owner}</b>
            </div>
            <div>
              <small>EXPECTED CLOSE</small>
              <b>
                <Icon name="calendar" size={14} />
                {new Date(`${deal.expectedClose}T00:00:00`).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </b>
            </div>
            <div>
              <small>SOURCE</small>
              <b>{deal.source}</b>
            </div>
            <div>
              <small>SENTIMENT</small>
              <b>
                <span className={`sentiment-chip sentiment-${deal.sentiment.toLowerCase()}`}>
                  {deal.sentiment}
                </span>
              </b>
            </div>
          </div>
          <label className="field stage-select">
            Pipeline stage
            <select
              value={deal.stage}
              disabled={busy}
              onChange={(event) => void handleStageChange(event.target.value as DealStage)}
            >
              {DEAL_STAGES.map((stage) => (
                <option key={stage}>{stage}</option>
              ))}
            </select>
          </label>
          <section className="drawer-section">
            <div className="drawer-section-heading">
              <h3>AI insights</h3>
              <span className="ai-label">
                <Icon name="sparkles" size={13} /> NLP
              </span>
            </div>
            <div className="sentiment-overview score-overview">
              <div>
                <small>Lead score</small>
                <b>
                  {scoreResult
                    ? `${scoreResult.label} · ${scoreResult.score}/100`
                    : `${deal.score}/100`}
                </b>
                {scoreResult && <small className="score-reason">{scoreResult.reasoning}</small>}
              </div>
              <button
                className="button button-secondary button-small"
                disabled={busy}
                onClick={() => void scoreLead()}
              >
                <Icon name="sparkles" size={14} /> Score
              </button>
            </div>
            <div className="sentiment-overview">
              <div>
                <small>Latest signal</small>
                <b>{sentimentResult ?? deal.sentiment}</b>
              </div>
              <button
                className="button button-secondary button-small"
                disabled={busy}
                onClick={() => void analyzeSentiment()}
              >
                <Icon name="sparkles" size={14} /> Analyze
              </button>
            </div>
            {deal.sentiment === 'Negative' && (
              <div className="inline-alert">
                <span>!</span> Recent communication indicates a potential deal risk. Consider
                following up.
              </div>
            )}
            <div className="transcript-box">
              <label htmlFor="transcript">Summarize a call or meeting</label>
              <textarea
                id="transcript"
                rows={3}
                placeholder="Paste a transcript to generate a summary and action items..."
                {...transcriptForm.register('text', {
                  required: 'Add a transcript before summarizing.',
                  validate: (value) => !!value.trim() || 'Transcript cannot be blank.',
                })}
              />
              {transcriptForm.formState.errors.text && (
                <small className="form-field-error">
                  {transcriptForm.formState.errors.text.message}
                </small>
              )}
              <button
                type="button"
                className="text-button"
                disabled={busy || !transcriptValue?.trim()}
                onClick={() => void transcriptForm.handleSubmit(summarize)()}
              >
                <Icon name="sparkles" size={14} />
                {busy ? 'Working...' : 'Summarize transcript'}
              </button>
            </div>
            {summary && (
              <div className="summary-result">
                <b>Summary</b>
                <p>{summary}</p>
                {actionItems.length > 0 && (
                  <>
                    <b>Action items</b>
                    <ul>
                      {actionItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
            <button
              className="button button-secondary draft-trigger"
              disabled={busy}
              onClick={() => void createDraft()}
            >
              <Icon name="mail" size={15} /> Draft follow-up email
            </button>
            {draft && (
              <div className="draft-editor">
                <label className="field">
                  Subject
                  <input
                    value={draft.subject}
                    onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
                  />
                </label>
                <label className="field">
                  Draft · review and edit before sending
                  <textarea
                    rows={6}
                    value={draft.body}
                    onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                  />
                </label>
                <small>This draft is not sent automatically.</small>
              </div>
            )}
          </section>
          <section className="drawer-section">
            <div className="drawer-section-heading">
              <h3>Activity</h3>
              <span className="column-count">{timeline.length}</span>
            </div>
            <form
              className="activity-form"
              noValidate
              onSubmit={activityForm.handleSubmit(logActivity)}
            >
              <div className="activity-type-tabs">
                {(['note', 'call', 'email'] as const).map((type) => (
                  <button
                    type="button"
                    key={type}
                    className={activityType === type ? 'selected' : ''}
                    onClick={() => setActivityType(type)}
                  >
                    <Icon
                      name={type === 'note' ? 'note' : type === 'call' ? 'phone' : 'mail'}
                      size={14}
                    />
                    {type}
                  </button>
                ))}
              </div>
              <textarea
                aria-label="Activity details"
                rows={3}
                placeholder="Log a note, call, or email..."
                {...activityForm.register('rawText', {
                  required: 'Add activity details.',
                  validate: (value) => !!value.trim() || 'Activity details cannot be blank.',
                })}
              />
              {activityForm.formState.errors.rawText && (
                <small className="form-field-error">
                  {activityForm.formState.errors.rawText.message}
                </small>
              )}
              <button
                className="button button-primary button-small"
                disabled={busy || !note?.trim()}
                type="submit"
              >
                <Icon name="plus" size={14} /> Add activity
              </button>
            </form>
            <div className="timeline">
              {timeline.map((activity) => (
                <article className="timeline-item" key={activity.id}>
                  <span className={`activity-icon ${activity.type}`}>
                    <Icon
                      name={
                        activity.type === 'call'
                          ? 'phone'
                          : activity.type === 'email'
                            ? 'mail'
                            : 'note'
                      }
                      size={14}
                    />
                  </span>
                  <div>
                    <div className="timeline-heading">
                      <b>{activity.title}</b>
                      <small>
                        {new Date(activity.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </small>
                    </div>
                    <p>{activity.summary ?? activity.rawText}</p>
                    {activity.actionItems?.map((item) => (
                      <small className="action-line" key={item}>
                        <Icon name="check" size={13} />
                        {item}
                      </small>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            {!timeline.length && (
              <p className="empty-state">No activity yet. Log a touchpoint above.</p>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
