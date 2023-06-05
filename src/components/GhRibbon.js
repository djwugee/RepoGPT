import { GhRibbonSvg } from './GhRibbonSvg'
import { ExternalLink } from './ExternalLink'

export function GhRibbon() {
  return (
    <div className="animate-ribbon absolute top-0 right-0">
      <ExternalLink href="https://github.com/Markkop/RepoGPT">
        <GhRibbonSvg />
      </ExternalLink>
    </div>
  )
}
