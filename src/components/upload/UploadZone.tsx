'use client';

import React, { useState, useRef } from 'react';
import { useFinancialData } from '@/context/FinancialDataContext';
import { DocumentType } from '@/types/finance';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
  HelpCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const ALLOWED_DOCUMENT_TYPES: DocumentType[] = [
  'Bank statement',
  'Invoice sent',
  'Invoice received',
  'Receipt',
  'Other',
];

export function UploadZone() {
  const { addDocument } = useFinancialData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>('Bank statement');
  
  // Pipeline states: 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedCount, setExtractedCount] = useState(0);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadState('idle');
  };

  const startUploadPipeline = () => {
    if (!selectedFile) return;

    setUploadState('uploading');
    setUploadProgress(15);

    // Step 1: Uploading Simulation (0% -> 100%)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          // Transition to Step 2: Processing
          setUploadState('processing');
          
          setTimeout(async () => {
            try {
                const res = await addDocument(selectedFile, selectedType);
                if (res.success) {
                  setExtractedCount(res.count ?? 0);
                  setUploadState('completed');
                } else {
                  setUploadState('error');
                }
              } catch (e) {
                setUploadState('error');
              }
          }, 1200);

          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fin-card" style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            Upload Financial Documents
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Finlytics AI automatically extracts transactions, line items, and VAT details
          </p>
        </div>


      </div>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Upload Drag and Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
          }
        }}
        style={{
          border: isDragging ? '2px dashed #ff6b00' : '2px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '40px 24px',
          textAlign: 'center',
          backgroundColor: isDragging ? '#fff5ed' : '#f8fafc',
          transition: 'all 0.2s ease',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#fff5ed',
            color: '#ff6b00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}
        >
          <UploadCloud size={28} />
        </div>

        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
          Drag and drop your file here, or
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
          Supported formats: PDF, CSV, Excel, PNG, JPG (Bank statements, receipts, invoices)
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary"
          style={{ padding: '8px 22px' }}
        >
          Browse files
        </button>

        {selectedFile && (
          <div
            style={{
              marginTop: '18px',
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <FileCheck size={18} color="#ff6b00" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              {selectedFile.name}
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        )}
      </div>

      {/* Document Type Dropdown & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '14px',
          border: '1px solid #eef2f6',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            Select Document Type:
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DocumentType)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {ALLOWED_DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={startUploadPipeline}
          disabled={!selectedFile || uploadState === 'uploading' || uploadState === 'processing'}
          className="btn-primary"
          style={{
            opacity: !selectedFile || uploadState === 'uploading' || uploadState === 'processing' ? 0.6 : 1,
            cursor: !selectedFile ? 'not-allowed' : 'pointer',
          }}
        >
          <span>Start Processing</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Real-Time Processing Status States */}
      {uploadState !== 'idle' && (
        <div
          style={{
            marginTop: '20px',
            padding: '18px 20px',
            borderRadius: '14px',
            border: '1px solid',
            backgroundColor:
              uploadState === 'completed'
                ? '#f0fdf4'
                : uploadState === 'error'
                ? '#fef2f2'
                : '#f8fafc',
            borderColor:
              uploadState === 'completed'
                ? '#bbf7d0'
                : uploadState === 'error'
                ? '#fecaca'
                : '#e2e8f0',
          }}
        >
          {/* State 1: Uploading */}
          {uploadState === 'uploading' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Uploading...
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ff6b00' }}>
                  {uploadProgress}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ff6b00 0%, #ff881a 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.25s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* State 2: Processing */}
          {uploadState === 'processing' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Loader2 size={22} color="#ff6b00" className="animate-spin" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Processing...
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Extracting financial transactions, reconciling bank balances, and categorizing line items.
                </div>
              </div>
            </div>
          )}

          {/* State 3: Completed */}
          {uploadState === 'completed' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#15803d' }}>
                    Done — {extractedCount} transactions found ✓
                  </div>
                  <div style={{ fontSize: '12px', color: '#166534' }}>
                    Transactions successfully synced to your verified ledger and monthly reports.
                  </div>
                </div>
              </div>
              <button onClick={resetUpload} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                Upload Another File
              </button>
            </div>
          )}

          {/* State 4: Error */}
          {uploadState === 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertCircle size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#b91c1c' }}>
                    Error — Could not process ✗
                  </div>
                  <div style={{ fontSize: '12px', color: '#7f1d1d' }}>
                    Unable to parse document rows. The file may be password protected or low resolution.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => {
                    startUploadPipeline();
                  }}
                  className="btn-primary"
                  style={{ backgroundColor: '#ef4444', padding: '6px 14px', fontSize: '13px' }}
                >
                  <RefreshCw size={14} />
                  <span>Retry</span>
                </button>
                <a
                  href="mailto:support@finlytics.ai"
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                >
                  <HelpCircle size={14} />
                  <span>Contact Support</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
