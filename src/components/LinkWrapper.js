import Link from 'next/link'
import { ExternalLink } from './ExternalLink'

export function LinkWrapper({ href, children, ariaHidden, tabIndex }) {
  if (!href) return children
  if (href.startsWith('http') || href.startsWith('mailto')) {
    return (
      <ExternalLink href={href} ariaHidden={ariaHidden} tabIndex={tabIndex}>
        {children}
      </ExternalLink>
    )
  }
  return (
    <Link href={href} aria-hidden={ariaHidden} tabIndex={tabIndex}>
      {children}
    </Link>
  )
}
