import { useState } from 'react'
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { createStream } from '../../services/dev.service'

export default function StreamsTab({ streams, inputStyle, sectionHead, card, onCreated, onToggle }) {
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
        year: new Date().getFullYear(),
        batch: 'A',
        stream: 1,
        callup_date: '',
        service_end: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const result = await createStream(form)
            onCreated(result.data)
            setForm({ year: new Date().getFullYear(), batch: 'A', stream: 1, callup_date: '', service_end: '' })
            setShowForm(false)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create stream')
        } finally {
            setLoading(false)
        }
    }

    const labelStyle = {
        display: 'block',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: '#4a5e52',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '6px'
    }

    return (
        <>
            <button
                onClick={() => setShowForm(!showForm)}
                style={{
                    width: '100%',
                    background: '#008751',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'white',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    marginBottom: '14px'
                }}
            >
                <Plus size={16} color="white" />
                {showForm ? 'Cancel' : 'Add Stream'}
            </button>

            {showForm && (
                <div style={{ ...card, marginBottom: '14px' }}>
                    {error && (
                        <div style={{
                            background: '#fff0f0', color: '#e53e3e', fontSize: '0.8rem',
                            padding: '10px 14px', borderRadius: '10px', marginBottom: '12px'
                        }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>

                        {/* YEAR + BATCH + STREAM */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                            <div>
                                <label style={labelStyle}>Year</label>
                                <input
                                    type="number"
                                    value={form.year}
                                    onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Batch</label>
                                <select
                                    value={form.batch}
                                    onChange={e => setForm({ ...form, batch: e.target.value })}
                                    style={{ ...inputStyle, appearance: 'none', height: '44px' }}
                                >
                                    {['A', 'B', 'C'].map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Stream</label>
                                <select
                                    value={form.stream}
                                    onChange={e => setForm({ ...form, stream: parseInt(e.target.value) })}
                                    style={{ ...inputStyle, appearance: 'none', height: '44px' }}
                                >
                                    {[1, 2].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <label style={labelStyle}>Call-up Date</label>
                        <input
                            type="date"
                            value={form.callup_date}
                            onChange={e => setForm({ ...form, callup_date: e.target.value })}
                            required
                            style={inputStyle}
                        />

                        <label style={labelStyle}>Service End Date</label>
                        <input
                            type="date"
                            value={form.service_end}
                            onChange={e => setForm({ ...form, service_end: e.target.value })}
                            required
                            style={inputStyle}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: loading ? '#c2e0cf' : '#008751',
                                border: 'none', borderRadius: '12px', padding: '13px',
                                cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.88rem',
                                fontWeight: 700, color: 'white',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        >
                            {loading ? 'Creating...' : 'Add Stream'}
                        </button>
                    </form>
                </div>
            )}

            <div style={sectionHead}>All Streams</div>
            {streams.length === 0 && (
                <div style={{ ...card, textAlign: 'center', color: '#8fa396', fontSize: '0.82rem' }}>
                    No streams yet
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {streams.map(stream => (
                    <div
                        key={stream.id}
                        style={{
                            ...card,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 0
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12' }}>
                                {stream.year} Batch {stream.batch} Stream {stream.stream}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#8fa396', marginTop: '2px' }}>
                                {stream.callup_date} → {stream.service_end}
                            </div>
                        </div>
                        <button
                            onClick={() => onToggle(stream.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            {stream.is_active
                                ? <ToggleRight size={28} color="#008751" />
                                : <ToggleLeft size={28} color="#8fa396" />
                            }
                        </button>
                    </div>
                ))}
            </div>
        </>
    )
}