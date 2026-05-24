/**
 * OptionList — selectable picker rendered for an `options` fenced block.
 *
 * The shopping agent emits a fence carrying a JSON payload describing
 * which products the user should choose between (see the
 * `options-block` interaction skill). The agent ends its turn after
 * emitting the fence; this component drives the human-in-the-loop
 * selection and, on submit, resumes the same session with a structured
 * "Selected: …" message that the agent reads on its next turn.
 *
 * States:
 *   - skeleton:  the fence is still streaming (or just opened) and we
 *                don't have a parsed payload yet — render shimmer cards.
 *   - error:     the closed block failed to parse — show a small
 *                explanation; the agent itself sees its own bad emission
 *                and can recover.
 *   - live:      the latest block, session is idle waiting for a pick —
 *                cards are clickable, kbd nav is wired.
 *   - history:   a block from an earlier turn that's already been
 *                answered — same visual shell but locked, with the
 *                previously-selected option highlighted (visual only;
 *                we don't replay the selection here).
 *
 * Keyboard:
 *   ← →  ↑ ↓   move focus
 *   space      toggle (multi-select)
 *   enter      single-select: pick + submit; multi-select: submit when valid
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { OptionItem, OptionListPayload } from './htmlBlocks';
import './optionList.css';

interface Props {
  payload: OptionListPayload | null;
  complete: boolean;
  error?: string;
  sessionId?: string;
}

const SKELETON_COUNT = 3;

export function OptionList(props: Props): React.ReactElement {
  const { payload, complete, error, sessionId } = props;

  // Streaming with no options parsed yet — show a full skeleton screen.
  if (!payload) {
    if (complete && error) {
      return (
        <div className="chatv2-optlist" data-testid="chatv2-optlist" data-state="error">
          <div className="chatv2-optlist__error">options block ignored: {error}</div>
        </div>
      );
    }
    return <OptionListSkeleton />;
  }

  // We have at least one parsed option. Render the picker; if the fence
  // is still streaming, OptionListReady will tack on trailing skeleton
  // placeholders as a "more incoming" hint.
  return <OptionListReady payload={payload} sessionId={sessionId} streaming={!complete} />;
}

function OptionListSkeleton(): React.ReactElement {
  return (
    <div className="chatv2-optlist" data-testid="chatv2-optlist" data-state="loading">
      <div className="chatv2-optlist__head">
        <div className="chatv2-optlist__skel-line chatv2-optlist__skel-line--med" />
      </div>
      <div className="chatv2-optlist__grid" aria-hidden="true">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={i} className="chatv2-optlist__skel-card">
            <div className="chatv2-optlist__skel-panel" />
            <div className="chatv2-optlist__skel-body">
              <div className="chatv2-optlist__skel-line chatv2-optlist__skel-line--med" />
              <div className="chatv2-optlist__skel-line chatv2-optlist__skel-line--short" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ReadyProps {
  payload: OptionListPayload;
  sessionId?: string;
  /** True while the fence is still streaming — tacks on trailing skeleton
   *  placeholders after the parsed cards so the user reads "more incoming." */
  streaming?: boolean;
}

const TRAILING_SKELETONS_WHILE_STREAMING = 2;

function OptionListReady({ payload, sessionId, streaming }: ReadyProps): React.ReactElement {
  const { options, multiSelect, min, max, prompt } = payload;
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Effective field schema: agent-declared (preserves intent + order), else
  // union of every option's field keys in first-seen order. Missing values
  // in a card render as "—" to keep vertical alignment across cards.
  const effectiveSchema = useMemo<string[]>(() => {
    if (payload.fieldSchema && payload.fieldSchema.length > 0) return payload.fieldSchema;
    const seen: string[] = [];
    for (const opt of options) {
      if (!opt.fields) continue;
      for (const key of Object.keys(opt.fields)) {
        if (!seen.includes(key)) seen.push(key);
      }
    }
    return seen;
  }, [payload.fieldSchema, options]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [cursor, setCursor] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const locked = submitted;

  const toggle = useCallback((idx: number): void => {
    const opt = options[idx];
    if (!opt) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (multiSelect) {
        if (next.has(opt.id)) next.delete(opt.id);
        else if (next.size < max) next.add(opt.id);
      } else {
        next.clear();
        next.add(opt.id);
      }
      return next;
    });
  }, [options, multiSelect, max]);

  const canSubmit = useMemo(() => {
    const n = selected.size;
    if (multiSelect) return n >= min && n <= max;
    return n === 1;
  }, [selected, multiSelect, min, max]);

  const submitLabel = useMemo(() => {
    const n = selected.size;
    if (submitted) {
      const titles = options.filter((o) => selected.has(o.id)).map((o) => o.title);
      return titles.length === 1 ? `Sent: ${titles[0]}` : `Sent ${titles.length} items`;
    }
    if (multiSelect) {
      if (n === 0) return min > 1 ? `Pick at least ${min}` : 'Pick options to continue';
      if (n < min) return `${min - n} more to continue`;
      return `Confirm ${n} item${n > 1 ? 's' : ''}`;
    }
    if (n === 1) {
      const title = options.find((o) => selected.has(o.id))?.title ?? '';
      const truncated = title.length > 32 ? `${title.slice(0, 31)}…` : title;
      return `Confirm "${truncated}"`;
    }
    return 'Pick one to continue';
  }, [selected, submitted, multiSelect, min, max, options]);

  const submit = useCallback(async (): Promise<void> => {
    if (!canSubmit || locked) return;
    if (!sessionId) {
      setSubmitError('no active session');
      return;
    }
    const picked = options.filter((o) => selected.has(o.id));
    const message = formatSelectionMessage(picked);
    setSubmitted(true);
    setSubmitError(null);
    try {
      const result = await window.electronAPI?.sessions?.resume(sessionId, message);
      if (result?.error) {
        setSubmitError(result.error);
        setSubmitted(false);
      }
    } catch (err) {
      setSubmitError((err as Error).message);
      setSubmitted(false);
    }
  }, [canSubmit, locked, sessionId, options, selected]);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (locked) return;
    const n = options.length;
    if (n === 0) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setCursor((c) => (c + 1) % n);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setCursor((c) => (c - 1 + n) % n);
        break;
      case ' ':
        e.preventDefault();
        toggle(cursor);
        break;
      case 'Enter':
        e.preventDefault();
        if (multiSelect) {
          if (canSubmit) void submit();
        } else {
          // Single-select Enter: pick the focused card AND submit.
          toggle(cursor);
          // Schedule submit after the toggle's state flush.
          setTimeout(() => { void submit(); }, 0);
        }
        break;
      default:
        break;
    }
  }, [locked, options.length, cursor, multiSelect, canSubmit, toggle, submit]);

  // Auto-focus the grid on mount so kbd nav works without click.
  useEffect(() => {
    if (!submitted && gridRef.current) {
      gridRef.current.focus({ preventScroll: true });
    }
  }, [submitted]);

  const hint = submitted
    ? <span className="chatv2-optlist__hint">sent to agent</span>
    : multiSelect
      ? (
        <span className="chatv2-optlist__hint">
          <span className="chatv2-optlist__kbd">space</span>toggle ·
          <span className="chatv2-optlist__kbd">↵</span>confirm
        </span>
      )
      : (
        <span className="chatv2-optlist__hint">
          <span className="chatv2-optlist__kbd">←</span>
          <span className="chatv2-optlist__kbd">→</span>navigate ·
          <span className="chatv2-optlist__kbd">↵</span>confirm
        </span>
      );

  // Post-submit: collapse to a compact "Chosen: …" view showing only
  // the picked items, no submit, no kbd nav. Reads like a sent message
  // rather than a live picker.
  if (submitted) {
    const chosen = options.filter((o) => selected.has(o.id));
    return (
      <div
        className="chatv2-optlist chatv2-optlist--chosen"
        data-testid="chatv2-optlist"
        data-state="chosen"
        data-multi={multiSelect}
      >
        <div className="chatv2-optlist__head">
          <div className="chatv2-optlist__prompt">
            Chose: {chosen.map((o) => o.title).join(', ')}
          </div>
          <div className="chatv2-optlist__meta">sent to agent</div>
        </div>
        <div className="chatv2-optlist__grid" aria-hidden="false">
          {chosen.map((opt) => (
            <OptionCard
              key={opt.id}
              opt={opt}
              fieldSchema={effectiveSchema}
              selected
              focused={false}
              disabled
              onClick={() => { /* locked */ }}
              onHover={() => { /* locked */ }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="chatv2-optlist"
      data-testid="chatv2-optlist"
      data-state={streaming ? 'streaming' : 'live'}
      data-multi={multiSelect}
    >
      <div className="chatv2-optlist__head">
        {prompt && <div className="chatv2-optlist__prompt">{prompt}</div>}
        <div className="chatv2-optlist__meta">
          {options.length} option{options.length === 1 ? '' : 's'}
          {streaming && ' · loading more…'}
          {multiSelect && min === max && ` · pick exactly ${min}`}
          {multiSelect && min !== max && ` · pick ${min}–${max}`}
        </div>
      </div>

      <div
        ref={gridRef}
        className="chatv2-optlist__grid"
        tabIndex={locked ? -1 : 0}
        onKeyDown={handleKey}
      >
        {options.map((opt, idx) => (
          <OptionCard
            key={opt.id}
            opt={opt}
            fieldSchema={effectiveSchema}
            selected={selected.has(opt.id)}
            focused={!locked && idx === cursor}
            disabled={locked}
            onClick={() => {
              if (locked) return;
              setCursor(idx);
              toggle(idx);
              gridRef.current?.focus({ preventScroll: true });
            }}
            onHover={() => { if (!locked) setCursor(idx); }}
          />
        ))}
        {streaming && Array.from({ length: TRAILING_SKELETONS_WHILE_STREAMING }).map((_, i) => (
          <div key={`skel-${i}`} className="chatv2-optlist__skel-card" aria-hidden="true">
            <div className="chatv2-optlist__skel-panel" />
            <div className="chatv2-optlist__skel-body">
              <div className="chatv2-optlist__skel-line chatv2-optlist__skel-line--med" />
              <div className="chatv2-optlist__skel-line chatv2-optlist__skel-line--short" />
            </div>
          </div>
        ))}
      </div>

      <div className="chatv2-optlist__foot">
        <button
          type="button"
          className="chatv2-optlist__submit"
          disabled={!canSubmit || locked}
          onClick={() => { void submit(); }}
        >
          {submitLabel}
        </button>
        {submitError ? (
          <span className="chatv2-optlist__hint" style={{ color: '#ff7a7a' }}>{submitError}</span>
        ) : hint}
      </div>
    </div>
  );
}

interface CardProps {
  opt: OptionItem;
  /** Field labels to render in order across every card; cells missing
   *  the corresponding value render as "—" to keep alignment. */
  fieldSchema: string[];
  selected: boolean;
  focused: boolean;
  disabled: boolean;
  onClick: () => void;
  onHover: () => void;
}

const MISSING_FIELD_GLYPH = '—';

function OptionCard({ opt, fieldSchema, selected, focused, disabled, onClick, onHover }: CardProps): React.ReactElement {
  const [broken, setBroken] = useState<boolean>(false);
  return (
    <button
      type="button"
      className="chatv2-optlist__card"
      data-selected={selected}
      data-focused={focused}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onHover}
    >
      <div className="chatv2-optlist__panel">
        {!broken ? (
          <img
            className="chatv2-optlist__img"
            src={opt.image}
            alt=""
            loading="lazy"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="chatv2-optlist__img chatv2-optlist__img--broken">no image</div>
        )}
        <span className="chatv2-optlist__pin" aria-hidden="true">✓</span>
      </div>
      <div className="chatv2-optlist__body">
        <div className="chatv2-optlist__title">{opt.title}</div>
        {opt.description && <p className="chatv2-optlist__desc">{opt.description}</p>}
        {fieldSchema.length > 0 && (
          <dl className="chatv2-optlist__fields">
            {fieldSchema.map((label) => {
              const value = opt.fields?.[label];
              return (
                <div key={label} className="chatv2-optlist__field">
                  <dt className="chatv2-optlist__field-label">{label}</dt>
                  <dd className="chatv2-optlist__field-value" data-missing={!value}>
                    {value ?? MISSING_FIELD_GLYPH}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
      </div>
    </button>
  );
}

function formatSelectionMessage(picked: OptionItem[]): string {
  if (picked.length === 0) return 'Selected: (none)';
  if (picked.length === 1) {
    const p = picked[0];
    return `Selected from options: ${p.title} (id: ${p.id})`;
  }
  const lines = picked.map((p) => `- ${p.title} (id: ${p.id})`);
  return `Selected from options:\n${lines.join('\n')}`;
}
