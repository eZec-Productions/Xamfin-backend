'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function MobileReportRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params?.id) {
      router.replace(`/dashboard/reports/${params.id}`);
    } else {
      router.replace('/dashboard/reports');
    }
  }, [params, router]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif',
      color: '#64748b'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '32px', height: '32px', border: '3px solid #cbd5e1',
          borderTopColor: '#ff6b00', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto'
        }} />
        <p style={{ fontSize: '14px', fontWeight: 600 }}>Opening financial report...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
