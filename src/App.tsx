import React, { useEffect, useState, useMemo } from 'react'
import { type DocNode } from '@atlaskit/adf-schema'
import { JSONTransformer } from '@atlaskit/editor-json-transformer'
import { defaultSchema } from '@atlaskit/adf-schema/schema-default'
import { WikiMarkupTransformer } from '@atlaskit/editor-wikimarkup-transformer'
import { ReactRenderer } from '@atlaskit/renderer'
import Toggle from '@atlaskit/toggle'

const sampleJwm = 'h1. Hello, world!'

const sampleADF = `{
  "version": 1,
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": {
        "level": 1
      },
      "content": [
        {
          "type": "text",
          "text": "hello world"
        }
      ]
    }
  ]
}`

interface JiraWikiColumnProps {
  jwmText: string
  setJwmText: (text: string) => void
  isReadOnly: boolean
}

const JiraWikiColumn: React.FC<JiraWikiColumnProps> = ({ jwmText, setJwmText, isReadOnly }) => (
  <div className="column">
    <h2>Jira Wiki Markup (JWM)</h2>
    <textarea
      className="text-area"
      value={jwmText}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJwmText(e.target.value)}
      placeholder={sampleJwm}
      readOnly={isReadOnly}
    />
  </div>
)

interface AdfColumnProps {
  adfText: string
  setAdfText: (text: string) => void
  isReadOnly: boolean
}

const AdfColumn: React.FC<AdfColumnProps> = ({ adfText, setAdfText, isReadOnly }) => (
  <div className="column">
    <h2>Atlassian Doc Format (ADF)</h2>
    <textarea
      className="text-area"
      value={adfText}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdfText(e.target.value)}
      placeholder={sampleADF}
      readOnly={isReadOnly}
    />
  </div>
)

interface PreviewColumnProps {
  doc: DocNode | undefined
  placeholderText: string
}

const PreviewColumn: React.FC<PreviewColumnProps> = ({ doc, placeholderText }) => (
  <div className="column">
    <h2>Preview</h2>
    <div className="preview-container">
      { doc
        ? (<ReactRenderer document={doc} />)
        : ( <p className="preview-placeholder">{placeholderText}</p> )
      }
    </div>
  </div>
)

function App() {
  const [isJwmToAdf, setIsJwmToAdf] = useState<boolean>(true)

  const [jwmText, setJwmText] = useState<string>('')
  const [adfText, setAdfText] = useState<string>('')

  const [adfDoc, setAdfDoc] = useState <DocNode | undefined> (undefined)

  const wikiMarkupTransformer = useMemo(() => new WikiMarkupTransformer(defaultSchema), [])
  const jsonTransformer = useMemo(() => new JSONTransformer(), [])

  useEffect(() => {
    if (isJwmToAdf) {
      if (!jwmText.trim()) {
        setAdfText('')
        setAdfDoc(undefined)
        return
      }
      try {
        const proseMirrorNode = wikiMarkupTransformer.parse(jwmText)
        const adfJson = jsonTransformer.encode(proseMirrorNode) as DocNode
        setAdfText(JSON.stringify(adfJson, null, 2))
        setAdfDoc(adfJson)
      } catch (error) {
        console.error("Error converting JWM to ADF:", error)
        setAdfText('Error during conversion. Please check your Jira Wiki Markup for issues.')
        setAdfDoc(undefined)
      }
    }
    else {
      if (!adfText.trim()) {
        setJwmText('')
        setAdfDoc(undefined)
        return
      }
      try {
        const adfJson = JSON.parse(adfText) as DocNode
        setAdfDoc(adfJson)

        const proseMirrorNode = jsonTransformer.parse(adfJson)
        const generatedJwm = wikiMarkupTransformer.encode(proseMirrorNode)
        setJwmText(generatedJwm)

      } catch (error) {
        console.error("Error converting ADF to JWM:", error)
        setJwmText('Error during conversion. Please check your ADF JSON for issues.')
        setAdfDoc(undefined)
      }
    }
  }, [jwmText, adfText, isJwmToAdf, wikiMarkupTransformer, jsonTransformer])

  const handleToggleChange = () => {
    setIsJwmToAdf((prev) => !prev)
    setJwmText('')
    setAdfText('')
    setAdfDoc(undefined)
  }

  const JwmInputComponent = <JiraWikiColumn jwmText={jwmText} setJwmText={setJwmText} isReadOnly={!isJwmToAdf} />
  const AdfInputComponent = <AdfColumn adfText={adfText} setAdfText={setAdfText} isReadOnly={isJwmToAdf} />

  return (
    <div className="App">
      <header className="app-header">
        <h1>JWM⇆ADF Converter</h1>
        <p>A simple tool to convert between Jira Wiki Markup and Atlassian Document Format</p>
      </header>
      <div className="toggle-area">
        <span className="toggle-label">JWM → ADF</span>
        <Toggle
          id="direction-toggle"
          size="large"
          isChecked={!isJwmToAdf}
          onChange={handleToggleChange}
        />
        <span className="toggle-label">ADF → JWM</span>
      </div>
      <div className="main-content">
        {isJwmToAdf ? JwmInputComponent : AdfInputComponent}
        {isJwmToAdf ? AdfInputComponent : JwmInputComponent}
        <PreviewColumn
          doc={adfDoc}
          placeholderText={`Enter ${isJwmToAdf ? "JWM" : "ADF"} content to see a live preview.`}
        />
      </div>
    </div>
  )
}

export default App
