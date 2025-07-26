'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check, Download } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export default function CodeBlock({ code, language = 'text', filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const handleDownload = () => {
    try {
      setDownloading(true)
      const extensions: { [key: string]: string } = {
        javascript: 'js',
        typescript: 'ts',
        python: 'py',
        html: 'html',
        css: 'css',
        sql: 'sql',
        json: 'json',
        xml: 'xml',
        bash: 'sh',
        shell: 'sh'
      }
      
      const ext = extensions[language.toLowerCase()] || 'txt'
      const fileName = filename || `code.${ext}`
      
      const blob = new Blob([code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setTimeout(() => setDownloading(false), 1000)
    } catch (err) {
      console.error('Failed to download code:', err)
      setDownloading(false)
    }
  }

  const getLanguageIcon = (lang: string) => {
    const icons: { [key: string]: string } = {
      javascript: '🟨',
      typescript: '🔷',
      python: '🐍',
      html: '🌐',
      css: '🎨',
      sql: '🗃️',
      json: '📦',
      xml: '📄',
      bash: '💻',
      shell: '💻',
      text: '📝'
    }
    return icons[lang.toLowerCase()] || '📝'
  }

  const lineCount = code.split('\n').length
  
  // Normalize language for syntax highlighter
  const normalizedLanguage = language.toLowerCase()

  // Custom style for VS Code theme
  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: '#0d1117',
      margin: 0,
      padding: '1rem',
      overflow: 'auto',
      fontSize: '14px',
      lineHeight: '1.5',
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace"
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: '#0d1117',
      color: '#e6edf3',
      fontSize: '14px',
      lineHeight: '1.5',
      fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace"
    }
  }

  return (
    <div className="relative bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden my-4 shadow-lg code-block-enter">
      {/* VS Code-style header */}
      <div className="flex items-center justify-between bg-[#161b22] border-b border-[#30363d] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27ca3f]"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{getLanguageIcon(language)}</span>
            {filename && (
              <span className="text-sm text-gray-300 font-medium">{filename}</span>
            )}
            <span className="text-xs text-gray-400 bg-[#21262d] px-2 py-1 rounded-md font-mono">
              {normalizedLanguage}
            </span>
            <span className="text-xs text-gray-500">
              {lineCount} line{lineCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownload}
            variant="ghost"
            size="sm"
            disabled={downloading}
            className="h-8 px-3 hover:bg-[#30363d] text-gray-400 hover:text-white text-xs transition-all duration-200"
            title="Download file"
          >
            {downloading ? (
              <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full"></div>
            ) : (
              <Download className="h-3 w-3" />
            )}
            <span className="ml-1 hidden sm:inline">Download</span>
          </Button>
          <Button
            onClick={handleCopy}
            variant="ghost"
            size="sm"
            className={`h-8 px-3 text-xs transition-all duration-200 ${
              copied 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'hover:bg-[#30363d] text-gray-400 hover:text-white'
            }`}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="ml-1 hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
        </div>
      </div>

      {/* Code content with professional syntax highlighting */}
      <div className="relative">
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={customStyle}
          showLineNumbers={true}
          lineNumberStyle={{
            color: '#6e7681',
            backgroundColor: '#0d1117',
            paddingRight: '1rem',
            borderRight: '1px solid #30363d',
            marginRight: '1rem',
            textAlign: 'right',
            userSelect: 'none',
            minWidth: '3em'
          }}
          customStyle={{
            margin: 0,
            background: '#0d1117',
            padding: 0,
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          codeTagProps={{
            style: {
              fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace",
              fontSize: '14px'
            }
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      
      {/* Footer with code info */}
      <div className="bg-[#161b22] border-t border-[#30363d] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            UTF-8
          </span>
          <span className="font-mono">{normalizedLanguage.toUpperCase()}</span>
          <span>{code.length} chars</span>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <span>✨</span>
          Professional code editor ready
        </div>
      </div>
    </div>
  )
}
