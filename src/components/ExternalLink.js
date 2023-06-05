import { twMerge } from 'tailwind-merge'

export function ExternalLink({
  className = '',
  href = '',
  children,
  target = '_blank',
  rel = 'noopener noreferrer',
  tabIndex,
  ariaHidden
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      tabIndex={tabIndex}
      aria-hidden={ariaHidden}
      className={twMerge('', className)}
    >
      {children}
    </a>
  )
}
