"use client"
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export default function FileUploader({ onFileUpload, isLoading }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    multiple: false,
  });

  return (
    <div {...getRootProps()} className={`mt-6 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        {isLoading ? (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Processing your memories...</p>
          </>
        ) : (
          <>
            <UploadCloud className="w-12 h-12 text-primary" />
            <p className="mt-4 text-foreground">
              {isDragActive ? 'Drop the file here ...' : "Drag 'n' drop your WhatsApp .txt file here"}
            </p>
            <p className="text-sm text-muted-foreground">or</p>
            <Button variant="outline" className="mt-2" onClick={(e) => e.preventDefault()} disabled={isLoading}>
              Click to upload
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
