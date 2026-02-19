'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface Problem {
  id: number
  title: string
  description: string
  category: string
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  username: string
  created_at: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'รอดำเนินการ', color: '#f59e0b' },
  in_progress: { label: 'กำลังดำเนินการ', color: '#3b82f6' },
  resolved: { label: 'แก้ไขแล้ว', color: '#10b981' },
  closed: { label: 'ปิดแล้ว', color: '#6b7280' },
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('กรุณา Login ก่อน')
      setLoading(false)
      return
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/problems`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProblems(res.data)
        setLoading(false)
      })
      .catch(() => {
        setError('ไม่สามารถดึงข้อมูลได้')
        setLoading(false)
      })
  }, [])

  if (loading) return <div style={styles.center}>กำลังโหลด...</div>
  if (error) return <div style={styles.center}>{error}</div>

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>รายการปัญหาทั้งหมด</h1>
      <p style={styles.subtitle}>พบ {problems.length} รายการ</p>

      <div style={styles.grid}>
        {problems.map((problem) => {
          const status = statusConfig[problem.status]
          return (
            <div key={problem.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.category}>{problem.category || 'ทั่วไป'}</span>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: status.color + '20',
                    color: status.color,
                    border: `1px solid ${status.color}40`,
                  }}
                >
                  {status.label}
                </span>
              </div>

              <h2 style={styles.cardTitle}>{problem.title}</h2>
              <p style={styles.cardDesc}>{problem.description}</p>

              <div style={styles.cardFooter}>
                <span style={styles.meta}>👤 {problem.username}</span>
                <span style={styles.meta}>
                  🕐 {new Date(problem.created_at).toLocaleDateString('th-TH')}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'sans-serif',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#111',
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: '32px',
  },
  grid: {
    display: 'grid',
    gap: '16px',
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  category: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  badge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '999px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111',
    marginBottom: '8px',
  },
  cardDesc: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  cardFooter: {
    display: 'flex',
    gap: '16px',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '12px',
  },
  meta: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#6b7280',
  },
}