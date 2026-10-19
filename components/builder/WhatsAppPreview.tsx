'use client';

// Shows the pre-filled WhatsApp text BEFORE the click, then the wa.me link.

import { useT } from '@/lib/i18n';

export interface WhatsAppPreviewProps {
  message: string;
  url: string;
  label?: string;
  className?: string;
  preClassName?: string;
  buttonClassName?: string;
  /** hide the preview (only when the theme renders the text elsewhere) */
  hidePreview?: boolean;
}

export default function WhatsAppPreview({
  message,
  url,
  label,
  className = '',
  preClassName = '',
  buttonClassName = '',
  hidePreview = false,
}: WhatsAppPreviewProps) {
  const t = useT();
  return (
    <div className={className}>
      {!hidePreview && (
        <>
          <p className="label-caps mb-2 text-ink-2">{t('wa.preview')}</p>
          <pre
            className={`max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-theme border border-line bg-surface p-3 font-mono text-xs leading-relaxed text-ink ${preClassName}`}
          >
            {message}
          </pre>
        </>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={
          buttonClassName ||
          'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-theme bg-accent px-5 py-3 font-medium text-bg transition-opacity hover:opacity-90'
        }
      >
        {label ?? t('wa.send')}
      </a>
    </div>
  );
}
