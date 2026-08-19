import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, QrCode, X, AlertCircle, Loader } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../../services/api'

export default function SignOutPanel() {
  const navigate = useNavigate()
  const scannerRef = useRef(null)

  const [meeting, setMeeting] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(null)
  const [form, setForm] = useState({ name: '', stateCode: '' })
  const [error, setError] = useState('')
  const [scanFeedback, setScanFeedback] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const todayRes = await api.get('/signout/today')
        if (todayRes.data?.data && isMounted) {
          const meetingData = todayRes.data.data
          setMeeting(meetingData)
          const listRes = await api.get(`/signout/list/${meetingData.id}`)
          if (isMounted) {
            setAttendance(listRes.data?.data?.attendance || [])
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleDirectQrSignOut = useCallback(async (decodedText) => {
    setError('')
    try {
      let payload
      try {
        payload = JSON.parse(decodedText)
      } catch (pErr) {
        throw new Error(`Scanned content is not valid JSON. Content: "${decodedText}"`)
      }

      if (
        !payload.meetingId ||
        !payload.attendanceId ||
        !payload.confirmedName ||
        !payload.confirmedStateCode
      ) {
        throw new Error(
          'QR code missing required JSON fields: meetingId, attendanceId, confirmedName, confirmedStateCode'
        )
      }

      setSigningOut(true)

      await api.post('/signout/confirm', {
        meetingId: payload.meetingId,
        attendanceId: payload.attendanceId,
        confirmedName: payload.confirmedName,
        confirmedStateCode: payload.confirmedStateCode
      })

      setAttendance((prev) =>
        prev.map((a) =>
          a.id === payload.attendanceId
            ? { ...a, signed_out_at: new Date().toISOString() }
            : a
        )
      )

      setScanFeedback('Sign-out successful!')
      setIsScanning(false)
    } catch (err) {
      console.error('Signout processing error:', err)
      setError(err.response?.data?.message || err.message || 'Sign-out failed')
    } finally {
      setSigningOut(false)
    }
  }, [])

  useEffect(() => {
    let timeoutId = null

    if (isScanning) {
      timeoutId = setTimeout(() => {
        const readerElement = document.getElementById('reader')
        if (!readerElement) return

        const html5QrcodeScanner = new Html5Qrcode('reader')
        scannerRef.current = html5QrcodeScanner

        const config = {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        }

        html5QrcodeScanner
          .start(
            { facingMode: 'environment' },
            config,
            async (decodedText) => {
              console.log('RAW QR DETECTED:', decodedText)
              setScanFeedback(`Scanned raw text: ${decodedText}`)
              await handleDirectQrSignOut(decodedText)
            },
            () => {
              // Silenced frame error callback
            }
          )
          .catch((err) => {
            console.error('Camera Init Error:', err)
            setError('Unable to access camera. Check permissions or try HTTPS.')
            setIsScanning(false)
          })
      }, 100)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)

      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current
            .stop()
            .catch((err) => console.error('Stop Error:', err))
        }
        scannerRef.current = null
      }
    }
  }, [isScanning, handleDirectQrSignOut])

  const handleConfirmSignOut = async (attendanceRecord) => {
    setSigningOut(true)
    setError('')
    try {
      await api.post('/signout/confirm', {
        meetingId: meeting.id,
        attendanceId: attendanceRecord.id,
        confirmedName: form.name,
        confirmedStateCode: form.stateCode
      })
      setAttendance((prev) =>
        prev.map((a) =>
          a.id === attendanceRecord.id
            ? { ...a, signed_out_at: new Date().toISOString() }
            : a
        )
      )
      setConfirming(null)
      setForm({ name: '', stateCode: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setSigningOut(false)
    }
  }

  const pending = attendance.filter((a) => !a.signed_out_at)
  const cleared = attendance.filter((a) => a.signed_out_at)

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: '#8fa396'
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f2f4f7',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        maxWidth: '390px',
        margin: '0 auto',
        paddingBottom: '40px'
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: '#ffffff',
          padding: '52px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 0 #e8ece9'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
            style={{
              width: '36px',
              height: '36px',
              background: '#f2f4f7',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} color="#4a5e52" />
          </button>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>
              Sign Out Panel
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
              {meeting ? meeting.title : 'No meeting today'}
            </div>
          </div>
        </div>

        {meeting && (
          <button
            type="button"
            onClick={() => {
              setIsScanning(!isScanning)
              setError('')
              setScanFeedback('')
            }}
            style={{
              background: isScanning ? '#e53e3e' : '#008751',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isScanning ? <X size={16} /> : <QrCode size={16} />}
            {isScanning ? 'Close' : 'Scan QR'}
          </button>
        )}
      </div>

      {meeting && (
        <div style={{ padding: '16px 20px 0' }}>
          {/* SCANNER WINDOW */}
          {isScanning && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#0d1b12',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Loader size={14} className="spin" /> Camera active — place QR inside box
              </div>

              <div
                id="reader"
                style={{
                  width: '100%',
                  minHeight: '250px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#000000'
                }}
              />
            </div>
          )}

          {/* SCAN FEEDBACK / SUCCESS */}
          {scanFeedback && (
            <div
              style={{
                background: '#e6f4ee',
                color: '#008751',
                fontSize: '0.8rem',
                padding: '12px 14px',
                borderRadius: '12px',
                marginBottom: '16px',
                fontWeight: 600
              }}
            >
              {scanFeedback}
            </div>
          )}

          {/* ERROR FEEDBACK */}
          {error && (
            <div
              style={{
                background: '#fff0f0',
                color: '#e53e3e',
                fontSize: '0.8rem',
                padding: '12px 14px',
                borderRadius: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* STATS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '16px'
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
              }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#8fa396',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: '6px'
                }}
              >
                Pending
              </div>
              <div
                style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d4900a' }}
              >
                {pending.length}
              </div>
            </div>
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
              }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#8fa396',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: '6px'
                }}
              >
                Cleared
              </div>
              <div
                style={{ fontSize: '1.5rem', fontWeight: 800, color: '#008751' }}
              >
                {cleared.length}
              </div>
            </div>
          </div>

          {/* MANUAL CONFIRMATION PANEL */}
          {confirming && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                marginBottom: '14px',
                border: '2px solid #008751'
              }}
            >
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#0d1b12',
                  marginBottom: '4px'
                }}
              >
                Verify Member — No. {confirming.sequence_number}
              </div>
              <div
                style={{ fontSize: '0.75rem', color: '#8fa396', marginBottom: '16px' }}
              >
                Confirm manual details
              </div>

              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                  style={{
                    width: '100%',
                    background: '#f2f4f7',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '0.85rem',
                    outline: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    marginBottom: '8px'
                  }}
                />
                <input
                  type="text"
                  value={form.stateCode}
                  onChange={(e) =>
                    setForm({ ...form, stateCode: e.target.value.toUpperCase() })
                  }
                  placeholder="State code"
                  style={{
                    width: '100%',
                    background: '#f2f4f7',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '0.85rem',
                    outline: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(null)
                    setForm({ name: '', stateCode: '' })
                    setError('')
                  }}
                  style={{
                    background: '#f2f4f7',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#4a5e52'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmSignOut(confirming)}
                  disabled={signingOut || !form.name || !form.stateCode}
                  style={{
                    background: '#008751',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: signingOut ? 'not-allowed' : 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'white'
                  }}
                >
                  {signingOut ? 'Verifying...' : 'Confirm'}
                </button>
              </div>
            </div>
          )}

          {/* LIST */}
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#8fa396',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '10px'
            }}
          >
            Sign-in List
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attendance.map((record) => (
              <div
                key={record.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: record.signed_out_at ? 0.6 : 1
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    background: record.signed_out_at ? '#e6f4ee' : '#f2f4f7',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    color: record.signed_out_at ? '#008751' : '#0d1b12',
                    flexShrink: 0
                  }}
                >
                  {record.sequence_number}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0d1b12',
                      marginBottom: '2px'
                    }}
                  >
                    {record.first_name} {record.last_name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                    {record.state_code}
                    {record.is_late ? ' · Late' : ''}
                  </div>
                </div>

                {record.signed_out_at ? (
                  <CheckCircle size={20} color="#008751" />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirming(record)
                      setForm({
                        name: `${record.first_name} ${record.last_name}`,
                        stateCode: record.state_code
                      })
                      setError('')
                    }}
                    disabled={!!confirming}
                    style={{
                      background: '#008751',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: confirming ? 'not-allowed' : 'pointer',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'white'
                    }}
                  >
                    Sign Out
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}