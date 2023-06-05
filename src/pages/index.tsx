import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { ExternalLinkIcon } from '../components/ExternalLinkIcon'
import { GhRibbon } from '../components/GhRibbon'
import { EyeSlashIcon } from '../components/EyeSlashIcon'
import { EyeIcon } from '../components/EyeIcon'

export default function Home() {
  const [apiKey, setApiKey] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [fileTree, setFileTree] = useState([])
  const [mergedFiles, setMergedFiles] = useState('')
  const [instruction, setInstruction] = useState('')
  const [model, setModel] = useState('gpt-4')
  const [temperature, setTemperature] = useState(0.1)
  const [maxTokens, setMaxTokens] = useState(4000)
  const [response, setResponse] = useState('')
  const [models, setModels] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [gitHubToken, setGitHubToken] = useState('')
  const [githubError, setGithubError] = useState(null)
  const [openAIError, setOpenAIError] = useState(null)
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showGithubToken, setShowGithubToken] = useState(false)

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mergedFiles)
      setShowCopyConfirmation(true)
      setTimeout(() => {
        setShowCopyConfirmation(false)
      }, 2000)
    } catch (err) {
      console.error(`Could not copy text: ${err}`)
    }
  }

  function retrieveValueFromLocalStorage(key, setter, defaultValue) {
    const savedValue = localStorage.getItem(key)
    if (savedValue) {
      setter(savedValue)
    } else if (defaultValue) {
      setter(defaultValue)
    }
  }
  useEffect(() => {
    retrieveValueFromLocalStorage('openai-api-key', setApiKey, '')
    retrieveValueFromLocalStorage('github-token', setGitHubToken, '')
    retrieveValueFromLocalStorage('github-repo-url', setRepoUrl, 'https://github.com/Markkop/RepoGPT')
  }, [])

  const displayFileTree = async (fileTree, indentLevel = 0) => {
    let allFiles = []
    for (const file of fileTree) {
      file.indentLevel = indentLevel
      allFiles.push(file)
      if (file.type === 'dir') {
        const response = await fetch(file.url)
        const childFileTree = await response.json()
        // Ensure that childFileTree is an array before trying to iterate over it
        if (Array.isArray(childFileTree)) {
          const childFiles = await displayFileTree(childFileTree, indentLevel + 1)
          allFiles = [...allFiles, ...childFiles]
        } else {
          console.error('Child file tree is not iterable:', childFileTree)
        }
      }
    }
    return allFiles
  }

  const handleSelectFile = (file, checked) => {
    setSelectedFiles((prevFiles) => {
      if (checked) {
        // New file selected
        return [...prevFiles, file]
      } else {
        // File unselected, remove it
        return prevFiles.filter((f) => f !== file)
      }
    })
  }

  const handleGetFileTree = async (e) => {
    try {
      e.preventDefault()
      setGithubError(null)
      localStorage.setItem('github-repo-url', repoUrl)
      const repoPath = repoUrl.split('github.com/')[1]
      const apiUrl = `https://api.github.com/repos/${repoPath}/contents`
      const headers = {} as any
      if (gitHubToken) {
        headers.Authorization = `token ${gitHubToken}`
      }
      const response = await fetch(apiUrl, { headers })

      const json = await response.json()

      if (json.message) {
        throw new Error(json.message)
      }

      const completeFileTree = await displayFileTree(json)
      setFileTree(completeFileTree)
      setSelectedFiles([]) // Clear selected files when fetching a new file tree
    } catch (error) {
      console.error(error)
      setGithubError(error.message)
    }
  }

  const updateMergedFilesPreview = async () => {
    const fileContents = await Promise.all(
      selectedFiles.map(async (file) => {
        try {
          const headers = {} as any
          if (gitHubToken) {
            headers.Authorization = `token ${gitHubToken}`
          }
          const response = await fetch(file.download_url)

          if (!response.ok) {
            throw new Error(response.statusText)
          }

          const content = await response.text()
          return `######## ${file.name}\n${content}`
        } catch (error) {
          console.error(error)
          setGithubError(error.message)
          return `######## ${file.name}\n${error.message}`
        }
      })
    )
    const mergedFiles = fileContents.join('\n')
    setMergedFiles(mergedFiles)
  }

  useEffect(() => {
    // Call this function when selectedFiles state changes
    updateMergedFilesPreview()
  }, [selectedFiles])

  const handleSendToOpenAI = async (e) => {
    try {
      e.preventDefault()
      setOpenAIError(null)
      if (!apiKey) {
        setOpenAIError('Please enter an OpenAI API key')
        return
      }
      const messages = mergedFiles.split('\n########').map((content) => {
        return { role: 'user', content: '######## ' + content.trim() }
      })

      messages.push({ role: 'user', content: instruction })

      setIsLoading(true)

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: Number(temperature),
          max_tokens: Number(maxTokens)
        })
      })

      const completion = await response.json()
      setResponse(completion.choices[0].message.content)

      setIsLoading(false)
    } catch (error) {
      console.error(error)
      setOpenAIError(error.message)
    }
  }

  const fetchModels = async () => {
    if (!apiKey) {
      return
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })

    const models = await response.json()
    setModels(models.data)
  }

  useEffect(() => {
    // Fetch models on component mount
    fetchModels()
  }, [])

  useEffect(() => {
    // Call this function when checkboxes state changes
    updateMergedFilesPreview()
  }, [fileTree])

  return (
    <main className="bg-background text-secondary">
      <div className="bg-surface font-sans px-5 max-w-4xl mx-auto shadow-l-lg relative">
        <GhRibbon />
        <h1 className="font-bold text-2xl mb-5 text-primary">🗃️ RepoGPT</h1>

        <p>Merge files from a Github repository to send them to OpenAI API with a prompt.</p>
        <p className="text-sm">
          Tip: if you have ChatGPT Plus, copy/paste the preview in the{' '}
          <span className="text-accent">
            <a href="https://chatgpt.com">chat</a>
          </span>{' '}
          to save API costs
        </p>

        <br />
        <form onSubmit={handleGetFileTree} className="">
          <div className="flex-col space-y-4">
            {[
              {
                storageKey: 'openai-api-key',
                label: 'OpenAI API Key',
                type: showPassword ? 'text' : 'password',
                value: apiKey,
                setValue: setApiKey,
                link: 'https://platform.openai.com/account/api-keys',
                buttonText: 'Save',
                showToggle: setShowPassword,
                isShowing: showPassword
              },
              {
                storageKey: 'github-token',
                label: 'GitHub Token',
                type: showGithubToken ? 'text' : 'password',
                value: gitHubToken,
                setValue: setGitHubToken,
                link: 'https://github.com/settings/tokens',
                buttonText: 'Save',
                showToggle: setShowGithubToken,
                isShowing: showGithubToken
              },
              {
                storageKey: 'repo-url',
                type: 'text',
                label: 'Repo URL',
                value: repoUrl,
                setValue: setRepoUrl,
                buttonText: 'Fetch'
              }
            ].map((field) => (
              <div key={field.storageKey}>
                <div className="flex gap-2 mb-2">
                  <h2 className="text-primary my-auto">{field.label}</h2>
                  {field.link && (
                    <ExternalLinkIcon svgClassName="text-primary h-3 w-3" className="my-auto" href={field.link} />
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    className="w-96 text-field"
                    type={field.type}
                    id={field.storageKey}
                    name={field.storageKey}
                    value={field.value}
                    onChange={(e) => field.setValue(e.target.value)}
                  />
                  {field.showToggle && (
                    <div onClick={() => field.showToggle(!field.isShowing)}>
                      {field.isShowing ? <EyeIcon /> : <EyeSlashIcon />}
                    </div>
                  )}
                  <button
                    id={`save-${field.storageKey}`}
                    onClick={() => localStorage.setItem(field.storageKey, field.value)}
                  >
                    {field.buttonText}
                  </button>
                </div>
                <div className="text-sm mt-2 opacity-70">
                  {field.label === 'GitHub Token' && (
                    <p>GitHub Token is optional, needed only for a higher rate limit and private repo access.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {githubError && <div className="text-error">{githubError}</div>}
        </form>
        <br />

        <br />

        <div className="flex flex-col lg:flex-row flex-wrap lg:flex-nowrap justify-between gap-2">
          <div>
            <h2>Select Files</h2>
            <div id="file-tree">
              {fileTree.map((file, index) => (
                <div key={index} style={{ marginLeft: `${file.indentLevel * 10}px` }}>
                  <label
                    className={twMerge(
                      'text-secondary opacity-70',
                      selectedFiles.includes(file) && 'text-primary opacity-100',
                      file.type === 'dir' && 'opacity-20'
                    )}
                  >
                    <input
                      className="mr-2"
                      type="checkbox"
                      disabled={file.type === 'dir'}
                      onChange={(e) => handleSelectFile(file, e.target.checked)}
                      checked={selectedFiles.includes(file)}
                    />
                    {file.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex space-x-2 mb-2">
              <h2>Merged Files</h2>
              <button onClick={handleCopyToClipboard} className="text-xs px-1 py-0">
                {showCopyConfirmation ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <textarea
              className="w-full"
              id="output"
              rows={20}
              cols={80}
              readOnly
              value={mergedFiles}
              onChange={(e) => setMergedFiles(e.target.value)}
            ></textarea>
          </div>
        </div>

        <br />
        <br />

        <h2>Prompt</h2>
        <textarea
          className="w-full"
          id="instruction"
          name="instruction"
          rows={20}
          cols={80}
          placeholder="rewrite this entire application"
          required
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        ></textarea>

        <br />

        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="models">Model</label>
            <select className="w-60" id="models" name="models" value={model} onChange={(e) => setModel(e.target.value)}>
              <option>gpt-4</option>
              <option>gpt-3.5-turbo</option>
            </select>
          </div>

          <div>
            <label htmlFor="temperature">Temperature</label>
            <input
              className="w-60 py-2 px-3"
              type="number"
              id="temperature"
              name="temperature"
              min="0"
              max="1"
              step="0.01"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
            />
          </div>

          <div>
            <label htmlFor="max-tokens">Max Tokens</label>
            <input
              className="w-60"
              type="number"
              id="max-tokens"
              name="max-tokens"
              min="1"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
            />
          </div>
        </div>

        <button className="my-4" id="send-to-openai" onClick={handleSendToOpenAI}>
          Send to OpenAI
        </button>
        {openAIError && <div className="text-error">{openAIError}</div>}

        <br />

        <h2>OpenAI Response</h2>
        <textarea
          className="w-full"
          id="openai-response"
          rows={20}
          cols={80}
          readOnly
          value={response}
          onChange={(e) => setResponse(e.target.value)}
        ></textarea>
      </div>
    </main>
  )
}
