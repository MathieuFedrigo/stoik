import './USButton.css';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

type Variant = 'primary' | 'secondary';

type CommonProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type AsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type USButtonProps = AsButton | AsLink;

function buttonClassName(variant: Variant, className?: string): string {
  return ['us-button', `us-button--${variant}`, className]
    .filter(Boolean)
    .join(' ');
}

export function USButton({
  variant = 'primary',
  className,
  children,
  ...props
}: USButtonProps) {
  const classes = buttonClassName(variant, className);

  if ('href' in props && props.href !== undefined) {
    const { href, ...anchorProps } = props;
    return (
      <a className={classes} href={href} {...anchorProps}>
        {children}
      </a>
    );
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
