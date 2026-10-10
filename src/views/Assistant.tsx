import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOutletContext } from 'react-router-dom';
import type { AppContextValue } from '../interface/AppContext';
import type { AssistantAnswer } from '../interface/types';
import { crmApi } from '../services/crmApi';
import Icon from '../components/Icon';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
}
interface AssistantFormValues {
  query: string;
}

const suggestions = [
  'Which deals should I prioritize this week?',
  'What are the risks in my pipeline?',
  'Help me prepare for a negotiation',
];

export default function Assistant() {
  const { deals, contacts } = useOutletContext<AppContextValue>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm<AssistantFormValues>({
    defaultValues: { query: '' },
  });
  const query = watch('query');

  async function ask(text: string) {
    const prompt = text.trim();
    if (!prompt || busy) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: prompt };
    setMessages((current) => [...current, userMessage]);
    reset({ query: '' });
    setBusy(true);
    try {
      const result: AssistantAnswer = await crmApi.ask(prompt);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: result.answer,
          sources: result.sources,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text:
            error instanceof Error
              ? `I couldn't complete that request: ${error.message}`
              : "I couldn't complete that request. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function submit(values: AssistantFormValues) {
    void ask(values.query);
    reset({ query: '' });
  }

  return (
    <div className="page-content assistant-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">YOUR AI SALES PARTNER</div>
          <h1>Sales assistant</h1>
          <p>Get grounded answers from your pipeline and company knowledge.</p>
        </div>
        <div className="assistant-status">
          <span /> Ready to help
        </div>
      </div>
      <div className="assistant-layout">
        <section className="panel chat-panel">
          <div className="chat-header">
            <div className="assistant-mark">
              <Icon name="sparkles" size={21} />
            </div>
            <div>
              <b>Pipeline copilot</b>
              <small>Ask about deals, risks, and next steps</small>
            </div>
            <span className="privacy-label">Your workspace</span>
          </div>
          <div className="chat-messages" aria-live="polite">
            <div className="assistant-message">
              <span className="assistant-mark">
                <Icon name="sparkles" size={16} />
              </span>
              <div>
                <p>
                  Hi! I’m your sales assistant. I can help you understand your pipeline, spot risks,
                  and prepare for your next conversation.
                </p>
                <small>I’ll show the sources behind every answer.</small>
              </div>
            </div>
            {messages.map((message) => (
              <div className={`chat-message ${message.role}`} key={message.id}>
                {message.role === 'assistant' && (
                  <span className="assistant-mark">
                    <Icon name="sparkles" size={16} />
                  </span>
                )}
                <div className="message-bubble">
                  <p>{message.text}</p>
                  {message.sources?.length ? (
                    <div className="source-list">
                      <b>Sources</b>
                      {message.sources.map((source) => (
                        <span key={source}>↗ {source}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {busy && (
              <div className="assistant-message">
                <span className="assistant-mark">
                  <Icon name="sparkles" size={16} />
                </span>
                <div className="thinking">
                  <span />
                  <span />
                  <span /> Thinking...
                </div>
              </div>
            )}
          </div>
          {!messages.length && (
            <div className="suggestion-row">
              {suggestions.map((suggestion) => (
                <button key={suggestion} onClick={() => void ask(suggestion)}>
                  {suggestion}
                  <Icon name="arrow" size={14} />
                </button>
              ))}
            </div>
          )}
          <form className="chat-composer" noValidate onSubmit={handleSubmit(submit)}>
            <textarea
              aria-label="Ask your sales assistant"
              placeholder="Ask anything about your deals..."
              rows={2}
              {...register('query', { required: true, validate: (value) => !!value.trim() })}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button
              className="send-button"
              type="submit"
              aria-label="Send question"
              disabled={busy || !query.trim()}
            >
              <Icon name="send" size={17} />
            </button>
            <small>AI can make mistakes. Verify important information.</small>
          </form>
        </section>
        <aside className="assistant-sidebar">
          <section className="panel assistant-insight">
            <div className="insight-top">
              <span className="stat-icon lavender">
                <Icon name="sparkles" />
              </span>
              <span className="soft-badge">LIVE CONTEXT</span>
            </div>
            <h2>Your pipeline, at a glance</h2>
            <p>The assistant can use your active workspace data to shape its answers.</p>
            <div className="context-stat">
              <span>Open deals</span>
              <b>{deals.filter((deal) => !deal.stage.startsWith('Closed')).length}</b>
            </div>
            <div className="context-stat">
              <span>Active contacts</span>
              <b>{contacts.length}</b>
            </div>
            <div className="context-stat">
              <span>Needs attention</span>
              <b>{deals.filter((deal) => deal.sentiment === 'Negative').length}</b>
            </div>
          </section>
          <section className="knowledge-card">
            <span className="knowledge-icon">
              <Icon name="note" />
            </span>
            <b>Make answers more helpful</b>
            <p>
              Connect product guides, pricing policies, and playbooks to ground answers in your
              company knowledge.
            </p>
            <button className="text-button" type="button">
              Knowledge sources <Icon name="arrow" size={14} />
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
