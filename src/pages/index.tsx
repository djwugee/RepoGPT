import { useEffect, useState } from 'react'

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
      localStorage.setItem('github-repo-url', repoUrl)
      const repoPath = repoUrl.split('github.com/')[1]
      const apiUrl = `https://api.github.com/repos/${repoPath}/contents`
      const headers = {} as any
      if (gitHubToken) {
        headers.Authorization = `token ${gitHubToken}`
      }
      const response = await fetch(apiUrl, { headers })

      const initialFileTree = await response.json()
      const completeFileTree = await displayFileTree(initialFileTree)
      setFileTree(completeFileTree)
      setSelectedFiles([]) // Clear selected files when fetching a new file tree
    } catch (error) {
      console.error(error)
      alert('Error getting file tree. Please check console.')
    }
  }

  const updateMergedFilesPreview = async () => {
    const fileContents = await Promise.all(
      selectedFiles.map(async (file) => {
        const headers = {} as any
        if (gitHubToken) {
          headers.Authorization = `token ${gitHubToken}`
        }
        const response = await fetch(file.download_url, { headers })
        const content = await response.text()
        return `######## ${file.name}\n${content}`
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
    e.preventDefault()
    if (!apiKey) {
      alert('Please enter an API key.')
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
    <div className="font-sans p-5 max-w-4xl mx-auto">
      <h1 className="font-bold text-2xl mb-5">RepoGPT</h1>

      <div className="flex items-center">
        <input
          className="w-96 mr-2 py-2 border border-gray-300 rounded-md"
          type="password"
          id="openai-key"
          name="openai-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <button
          className="bg-indigo-500 text-white px-4 py-2 rounded"
          id="save-api-key"
          onClick={() => localStorage.setItem('openai-api-key', apiKey)}
        >
          Save Key
        </button>
      </div>
      <div className="flex items-center">
        <input
          className="w-96 mr-2 py-2 border border-gray-300 rounded-md"
          type="password"
          id="github-token"
          name="github-token"
          value={gitHubToken}
          onChange={(e) => setGitHubToken(e.target.value)}
        />
        <button
          className="bg-indigo-500 text-white px-4 py-2 rounded"
          id="save-github-token"
          onClick={() => localStorage.setItem('github-token', gitHubToken)}
        >
          Save GitHub Token
        </button>
      </div>

      <br />

      <form onSubmit={handleGetFileTree} className="flex items-center">
        <input
          className="w-96 mr-2 py-2 border border-gray-300 rounded-md"
          type="text"
          id="repo-url"
          name="repo-url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          required
        />
        <button className="bg-indigo-500 text-white px-4 py-2 rounded" type="submit">
          Get File Tree
        </button>
      </form>

      <br />

      <div className="flex justify-between">
        <div>
          <h2>Select Relevant Files:</h2>
          <div id="file-tree">
            {fileTree.map((file, index) => (
              <div key={index} style={{ marginLeft: `${file.indentLevel * 10}px` }}>
                <label>
                  <input
                    type="checkbox"
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
          <h2>Merged Files Preview:</h2>
          <textarea
            className="w-full py-2 px-3 border border-gray-300 rounded-md"
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

      <h2>Instruction:</h2>
      <textarea
        className="w-full py-2 px-3 border border-gray-300 rounded-md"
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
          <label htmlFor="models">Select Model:</label>
          <select
            className="w-60 py-2 px-3 border border-gray-300 rounded-md"
            id="models"
            name="models"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option>gpt-4</option>
            <option>gpt-3.5-turbo</option>
          </select>
        </div>

        <div>
          <label htmlFor="temperature">Temperature:</label>
          <input
            className="w-60 py-2 px-3 border border-gray-300 rounded-md"
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
          <label htmlFor="max-tokens">Max Tokens:</label>
          <input
            className="w-60 py-2 px-3 border border-gray-300 rounded-md"
            type="number"
            id="max-tokens"
            name="max-tokens"
            min="1"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
          />
        </div>
      </div>

      <button
        className="bg-indigo-500 text-white px-4 py-2 rounded my-4"
        id="send-to-openai"
        onClick={handleSendToOpenAI}
      >
        Send to OpenAI
      </button>

      <br />

      <h2>OpenAI Response:</h2>
      <textarea
        className="w-full py-2 px-3 border border-gray-300 rounded-md"
        id="openai-response"
        rows={20}
        cols={80}
        readOnly
        value={response}
        onChange={(e) => setResponse(e.target.value)}
      ></textarea>
    </div>
  )
}
