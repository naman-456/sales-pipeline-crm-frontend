import { useForm, useWatch } from 'react-hook-form';
import type { Contact, DealStage } from '../interface/types';
import { DEAL_STAGES } from '../interface/types';
import { crmApi } from '../services/crmApi';
import Icon from './Icon';

interface DealFormValues {
  contactId: string;
  stage: DealStage;
  value: number;
  owner: string;
  source: string;
  expectedClose: string;
  score: number;
}

export default function DealForm({
  contacts,
  onClose,
  onCreated,
  notify,
}: {
  contacts: Contact[];
  onClose: () => void;
  onCreated: () => Promise<void>;
  notify: (message: string, kind?: 'success' | 'error') => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DealFormValues>({
    defaultValues: {
      contactId: contacts[0]?.id ?? '',
      stage: 'New Lead',
      value: undefined,
      owner: 'Priya S.',
      source: 'Website Form',
      expectedClose: '',
      score: 35,
    },
  });
  const leadScore = useWatch({ control, name: 'score' });

  async function submit(form: DealFormValues) {
    if (!form.contactId) {
      notify('Create a contact before adding a deal.', 'error');
      return;
    }
    try {
      await crmApi.createDeal({
        contactId: form.contactId,
        stage: form.stage,
        value: form.value,
        owner: form.owner.trim(),
        source: form.source.trim(),
        expectedClose: form.expectedClose,
        score: form.score,
        tags: [],
      });
      await onCreated();
      notify('Deal added to your pipeline.');
      onClose();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to create deal.', 'error');
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="modal-card"
        aria-labelledby="deal-form-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">PIPELINE</span>
            <h2 id="deal-form-title">Create a deal</h2>
          </div>
          <button className="icon-button" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <form className="form-grid" noValidate onSubmit={handleSubmit(submit)}>
          <label className="field full-field">
            Contact
            <select
              {...register('contactId', { required: 'Choose a contact to link to this deal.' })}
            >
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} · {contact.company}
                </option>
              ))}
            </select>
            {errors.contactId && (
              <small className="form-field-error">{errors.contactId.message}</small>
            )}
          </label>
          <label className="field">
            Deal value
            <input
              type="number"
              min="1"
              step="1000"
              placeholder="250000"
              {...register('value', {
                valueAsNumber: true,
                required: 'Enter a deal value.',
                min: { value: 1, message: 'Deal value must be greater than zero.' },
              })}
            />
            {errors.value && <small className="form-field-error">{errors.value.message}</small>}
          </label>
          <label className="field">
            Lead score · {leadScore}
            <input
              type="range"
              min="0"
              max="100"
              {...register('score', { valueAsNumber: true, min: 0, max: 100 })}
            />
          </label>
          <label className="field">
            Stage
            <select {...register('stage', { required: 'Choose a pipeline stage.' })}>
              {DEAL_STAGES.map((stage) => (
                <option key={stage}>{stage}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Owner
            <input
              {...register('owner', {
                required: 'Enter a deal owner.',
                validate: (value) => !!value.trim() || 'Owner cannot be blank.',
              })}
            />
            {errors.owner && <small className="form-field-error">{errors.owner.message}</small>}
          </label>
          <label className="field">
            Source
            <input
              {...register('source', {
                required: 'Enter a lead source.',
                validate: (value) => !!value.trim() || 'Source cannot be blank.',
              })}
            />
            {errors.source && <small className="form-field-error">{errors.source.message}</small>}
          </label>
          <label className="field">
            Expected close
            <input
              type="date"
              {...register('expectedClose', { required: 'Select an expected close date.' })}
            />
            {errors.expectedClose && (
              <small className="form-field-error">{errors.expectedClose.message}</small>
            )}
          </label>
          <div className="form-actions full-field">
            <button className="button button-secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="button button-primary" disabled={isSubmitting} type="submit">
              <Icon name="plus" />
              {isSubmitting ? 'Creating...' : 'Create deal'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
