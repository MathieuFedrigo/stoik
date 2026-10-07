import { useState } from 'react';
import { USIcon } from '../generic/USIcon';

type Props = {
  value: string;
  id?: string;
  copyAriaLabel?: string;
  onCopyError?: (message: string) => void;
};

export function ReadonlyCopyField({
  value,
  id,
  copyAriaLabel = 'Copier le lien',
  onCopyError,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopyError?.('Impossible de copier dans le presse-papier.');
    }
  }

  return (
    <div className="readonly-field">
      <output id={id} className="readonly-field-value">
        {value}
      </output>
      <USIcon
        name="clipboard"
        className="readonly-field-copy"
        onClick={() => void copy()}
        ariaLabel={copied ? 'Lien copié' : copyAriaLabel}
      />
    </div>
  );
}
