import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOutletContext } from 'react-router-dom';
import type { AppContextValue } from '../interface/AppContext';
import type { DuplicateCandidate } from '../interface/types';
import { crmApi } from '../services/crmApi';
import Icon from '../components/Icon';

interface ContactFormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
}

export default function Contacts() {
  const { contacts, deals, reload, notify } = useOutletContext<AppContextValue>();
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    defaultValues: { name: '', company: '', email: '', phone: '' },
  });
  const filtered = contacts.filter((contact) =>
    `${contact.name} ${contact.company} ${contact.email}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  async function saveContact(values: ContactFormValues, skipDuplicateCheck = false) {
    try {
      const input = {
        name: values.name.trim(),
        company: values.company.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      };
      if (!skipDuplicateCheck) {
        const candidates = await crmApi.checkContactDuplicates(input);
        setDuplicates(candidates);
        if (candidates.length) {
          notify(
            'Possible duplicates found. Review the matches before creating this contact.',
            'error',
          );
          return;
        }
      }
      await crmApi.createContact(input);
      await reload();
      notify('Contact added.');
      setShowForm(false);
      reset();
      setDuplicates([]);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to create contact.', 'error');
    }
  }

  return (
    <div className="page-content">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">RELATIONSHIPS</div>
          <h1>Contacts</h1>
          <p>Build stronger relationships, one conversation at a time.</p>
        </div>
        <div className="heading-actions">
          <div className="search-control">
            <Icon name="search" />
            <input
              aria-label="Search contacts"
              placeholder="Search contacts..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <button className="button button-primary" onClick={() => setShowForm(true)}>
            <Icon name="plus" /> Add contact
          </button>
        </div>
      </div>
      <div className="contacts-summary">
        <span>
          <b>{contacts.length}</b> contacts
        </span>
        <span>
          Across <b>{new Set(contacts.map((contact) => contact.company)).size}</b> companies
        </span>
        <span>
          <b>{deals.length}</b> linked deals
        </span>
      </div>
      <div className="contacts-grid">
        {filtered.map((contact, index) => {
          const linkedDeals = deals.filter((deal) => deal.contactId === contact.id);
          const initials = contact.name
            .split(/\s+/)
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
          return (
            <article className="contact-card" key={contact.id}>
              <div className="contact-card-top">
                <div className={`contact-avatar avatar-${index % 5}`}>{initials}</div>
                <button className="card-menu" aria-label={`More about ${contact.name}`}>
                  ···
                </button>
              </div>
              <h2>{contact.name}</h2>
              <p>{contact.company}</p>
              <a className="contact-email" href={`mailto:${contact.email}`}>
                <Icon name="mail" size={15} />
                {contact.email}
              </a>
              <a className="contact-email" href={`tel:${contact.phone}`}>
                <Icon name="phone" size={15} />
                {contact.phone}
              </a>
              <div className="contact-card-footer">
                <span>
                  {linkedDeals.length} {linkedDeals.length === 1 ? 'deal' : 'deals'}
                </span>
                {linkedDeals.length > 0 && (
                  <span className="soft-badge">{linkedDeals[0].stage}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!filtered.length && (
        <div className="panel empty-state">No contacts found. Add a contact to get started.</div>
      )}
      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => event.target === event.currentTarget && setShowForm(false)}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-form-title"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">RELATIONSHIPS</span>
                <h2 id="contact-form-title">Add contact</h2>
              </div>
              <button className="icon-button" aria-label="Close" onClick={() => setShowForm(false)}>
                <Icon name="close" />
              </button>
            </div>
            <form
              className="form-grid"
              noValidate
              onSubmit={handleSubmit((values) => saveContact(values))}
            >
              <label className="field full-field">
                Full name
                <input
                  placeholder="Alex Morgan"
                  {...register('name', {
                    required: "Enter the contact's name.",
                    validate: (value) => !!value.trim() || 'Name cannot be blank.',
                    onChange: () => setDuplicates([]),
                  })}
                />
                {errors.name && <small className="form-field-error">{errors.name.message}</small>}
              </label>
              <label className="field full-field">
                Company
                <input
                  placeholder="Acme, Inc."
                  {...register('company', {
                    required: 'Enter a company name.',
                    validate: (value) => !!value.trim() || 'Company cannot be blank.',
                    onChange: () => setDuplicates([]),
                  })}
                />
                {errors.company && (
                  <small className="form-field-error">{errors.company.message}</small>
                )}
              </label>
              <label className="field">
                Email
                <input
                  type="email"
                  {...register('email', {
                    required: 'Enter an email address.',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address.',
                    },
                    onChange: () => setDuplicates([]),
                  })}
                />
                {errors.email && <small className="form-field-error">{errors.email.message}</small>}
              </label>
              <label className="field">
                Phone
                <input type="tel" {...register('phone', { onChange: () => setDuplicates([]) })} />
              </label>
              {duplicates.length > 0 && (
                <div className="duplicate-review full-field">
                  <b>Possible matches · review before creating</b>
                  <p>Confirm these are different people before you add another record.</p>
                  {duplicates.map(({ contact: candidate, similarity }) => (
                    <div className="duplicate-candidate" key={candidate.id}>
                      <span className="company-avatar">{candidate.company.slice(0, 1)}</span>
                      <span>
                        <b>{candidate.name}</b>
                        <small>
                          {candidate.company} · {candidate.email}
                        </small>
                      </span>
                      <span className="soft-badge">{Math.round(similarity * 100)}% match</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="form-actions full-field">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                {duplicates.length > 0 && (
                  <button
                    className="button button-secondary"
                    disabled={isSubmitting}
                    type="button"
                    onClick={() => setDuplicates([])}
                  >
                    Edit details
                  </button>
                )}
                <button
                  className="button button-primary"
                  disabled={isSubmitting}
                  type={duplicates.length > 0 ? 'button' : 'submit'}
                  onClick={
                    duplicates.length > 0
                      ? () => void handleSubmit((values) => saveContact(values, true))()
                      : undefined
                  }
                >
                  <Icon name="plus" />
                  {isSubmitting
                    ? 'Saving...'
                    : duplicates.length > 0
                      ? 'Create anyway'
                      : 'Save contact'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
