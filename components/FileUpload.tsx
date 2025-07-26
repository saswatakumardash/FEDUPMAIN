'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  FileText, 
  X, 
  AlertCircle,
  Check
} from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (files: File[]) => void
  onFileRemove: (index: number) => void
  selectedFiles: File[]
  maxFiles?: number
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  disabled?: boolean
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFiles,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = ['image/*', '.pdf', '.txt', '.doc', '.docx'],
  disabled = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.match(type.replace('*', '.*'))
    })

    if (!isValidType) {
      return `File "${file.name}" is not a supported format.`
    }

    return null
  }

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files)
    const totalFiles = selectedFiles.length + fileArray.length

    if (totalFiles > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const validFiles: File[] = []
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      validFiles.push(file)
    }

    setError(null)
    onFileSelect(validFiles)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      return <FileText className="h-4 w-4 text-red-400" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <Card
        className={`relative border-2 border-dashed transition-all duration-300 cursor-pointer ${
          dragActive
            ? 'border-purple-500 bg-purple-500/10'
            : disabled
            ? 'border-gray-600 bg-gray-800/50'
            : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="p-8 text-center">
          <div className={`mx-auto mb-4 p-3 rounded-full w-fit ${
            dragActive ? 'bg-purple-500/20' : 'bg-gray-700'
          }`}>
            <Upload className={`h-6 w-6 ${
              dragActive ? 'text-purple-400' : 'text-gray-400'
            }`} />
          </div>
          
          <h3 className="text-lg font-medium text-white mb-2">
            {dragActive ? 'Drop files here' : 'Upload files'}
          </h3>
          
          <p className="text-gray-400 text-sm mb-4">
            Drag and drop files here, or click to browse
          </p>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>Maximum {maxFiles} files, {maxFileSize}MB each</p>
            <p>Supported: Images, PDF, Text documents</p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">
            Selected Files ({selectedFiles.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <Card key={index} className="p-3 bg-gray-800/50 border-gray-700">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getFileIcon(file)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      <Check className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onFileRemove(index)
                      }}
                      className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
