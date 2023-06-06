import { EyeIcon } from './EyeIcon'
import { EyeSlashIcon } from './EyeSlashIcon'
import { ExternalLinkIcon } from './ExternalLinkIcon'
import { SpinnerIcon } from './SpinnerIcon'

export function InputField({ field, isFetchingFileTree = false }) {
  const isRepoUrl = field.id === 'repo-url'
  const buttonText = field.buttonText || 'Save'

  const renderField = () => {
    if (field.type === 'select') {
      return (
        <select
          className="w-96"
          id={field.id}
          name={field.id}
          value={field.value}
          onChange={(e) => field.setValue(e.target.value)}
          disabled={isRepoUrl && isFetchingFileTree}
        >
          {field.options.map((option, i) => (
            <option key={i}>{option.name}</option>
          ))}
        </select>
      )
    }
    return (
      <input
        className="flex-grow w-96"
        type={field.type}
        id={field.id}
        name={field.id}
        value={field.value}
        min={field.min}
        max={field.max}
        step={field.step}
        placeholder={field.placeholder}
        onChange={(e) => field.setValue(e.target.value)}
        disabled={isRepoUrl && isFetchingFileTree}
      />
    )
  }

  return (
    <div key={field.id}>
      <div className="flex gap-2 mb-2">
        <h2 className="text-primary my-auto">{field.label}</h2>
        {field.link && <ExternalLinkIcon svgClassName="text-primary h-3 w-3" className="my-auto" href={field.link} />}
        {field.showToggle && (
          <div className="my-auto" onClick={() => field.showToggle(!field.isShowing)}>
            {field.isShowing ? <EyeIcon /> : <EyeSlashIcon />}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {renderField()}
        <button
          className="w-24"
          id={`save-${field.id}`}
          type={isRepoUrl ? 'submit' : 'button'}
          onClick={() => localStorage.setItem(field.id, field.value)}
          disabled={isRepoUrl && isFetchingFileTree}
        >
          {isFetchingFileTree && isRepoUrl ? <SpinnerIcon /> : buttonText}
        </button>
      </div>
    </div>
  )
}
