import { useState } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import StateCodeInput from '../common/StateCodeInput'

const STATE_CODE_REGEX = /^[A-Z]{2}\/\d{2}[A-Z]\/\d{4}$/

const labelStyle = {
    display: 'block', fontSize: '0.68rem', fontWeight: 600,
    color: '#4a5e52', textTransform: 'uppercase',
    letterSpacing: '0.5px', marginBottom: '8px'
}

export default function EditMemberModal({ member, streams = [], onClose, onSaved }) {
    const [stateCode, setStateCode] = useState(member.state_code || '')
    const [streamId, setStreamId] = useState(member.stream_id || '')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const codeChanged = stateCode !== member.state_code
    const streamChanged = Number(streamId) !== Number(member.stream_id)
    const hasChanges = codeChanged || streamChanged

    const handleSave = async () => {
        setError('')

        if (codeChanged && !STATE_CODE_REGEX.test(stateCode.toUpperCase())) {
            setError('Invalid state code. Format must be LA/26B/1879.')
            return
        }

        const payload = {}
        if (codeChanged) payload.state_code = stateCode.toUpperCase()
        if (streamChanged) payload.stream_id = Number(streamId)

        setSaving(true)
        try {
            const res = await api.patch(`/members/${member.id}/details`, payload)
            onSaved(res.data.data)
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(2px)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, padding: '20px'
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#ffffff', borderRadius: '18px', padding: '22px',
                    width: '100%', maxWidth: '360px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                }}
            >
                {/* HEADER */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: '18px'
                }}>
                    <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12' }}>
                            Edit Details
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8fa396', marginTop: '2px' }}>
                            {member.first_name} {member.last_name}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f2f4f7', border: 'none', borderRadius: '50%',
                            width: '30px', height: '30px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                    >
                        <X size={15} color="#4a5e52" />
                    </button>
                </div>

                {error && (
                    <div style={{
                        background: '#fff0f0', color: '#e53e3e', fontSize: '0.78rem',
                        padding: '10px 12px', borderRadius: '10px', marginBottom: '14px',
                        display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <AlertCircle size={14} color="#e53e3e" />
                        {error}
                    </div>
                )}

                {/* STATE CODE */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>State Code</label>
                    <StateCodeInput value={stateCode} onChange={setStateCode} disabled={saving} />
                </div>

                {/* STREAM */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Batch / Stream</label>
                    <select
                        value={streamId}
                        onChange={e => setStreamId(e.target.value)}
                        disabled={saving}
                        style={{
                            width: '100%', background: '#f2f4f7', border: 'none',
                            borderRadius: '12px', padding: '13px 14px',
                            fontSize: '0.85rem', color: '#0d1b12', outline: 'none',
                            appearance: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}
                    >
                        {streams.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.year} Batch {s.batch} Stream {s.stream}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ACTIONS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        style={{
                            background: '#f2f4f7', border: 'none', borderRadius: '12px',
                            padding: '13px', cursor: 'pointer', fontSize: '0.85rem',
                            fontWeight: 600, color: '#4a5e52',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        style={{
                            background: saving || !hasChanges ? '#c2e0cf' : '#008751',
                            border: 'none', borderRadius: '12px', padding: '13px',
                            cursor: saving || !hasChanges ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem', fontWeight: 700, color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '6px', fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}
                    >
                        <Save size={14} color="white" />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}