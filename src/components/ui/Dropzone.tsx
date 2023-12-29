import React, { useRef, useState } from 'react'

import { Button } from '@/components/ui/Button'

// Define the props expected by the Dropzone component
interface DropzoneProps {
  onChange: React.Dispatch<React.SetStateAction<File | null>>
  fileExtension?: string
}

export function Dropzone({ onChange, fileExtension }: DropzoneProps) {
  // Initialize state variables using the useState hook
  const fileInputRef = useRef<HTMLInputElement | null>(null) // Reference to file input element
  const [fileInfo, setFileInfo] = useState<string | null>(null) // Information about the uploaded file
  const [error, setError] = useState<string | null>(null) // Error message state

  // Function to handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Function to handle drop event
  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const { files } = e.dataTransfer
    handleFiles(files)
  }

  // Function to handle file input change event
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if (files) {
      handleFiles(files)
    }
  }

  // Function to handle processing of uploaded files
  const handleFiles = (files: FileList) => {
    const uploadedFile = files[0]

    // Check file extension
    if (fileExtension && !uploadedFile.name.endsWith(`.${fileExtension}`)) {
      setError(`Invalid file type. Expected: .${fileExtension}`)
      return
    }

    const fileSizeInKB = Math.round(uploadedFile.size / 1024) // Convert to KB

    onChange(uploadedFile)

    // Display file information
    setFileInfo(`Selected file: ${uploadedFile.name} (${fileSizeInKB} KB)`)
    setError(null) // Reset error state
  }

  // Function to simulate a click on the file input element
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <Button
      className="flex flex-col items-center justify-center p-8 w-full h-auto text-xs border rounded-sm border-dashed bg-muted hover:cursor-pointer hover:border-muted-foreground/50"
      variant="ghost"
      onClick={handleButtonClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-center text-muted-foreground">
        <span className="font-medium">Drag & drop file or click to select</span>
        <input
          ref={fileInputRef}
          type="file"
          accept={`.${fileExtension}`} // Set accepted file type
          onChange={handleFileInputChange}
          className="hidden"
          multiple
        />
      </div>

      {fileInfo && <p className="text-muted-foreground mt-4">{fileInfo}</p>}
      {error && <span className="text-red-500 mt-4">{error}</span>}
    </Button>
  )
}
