import { useState } from 'react'
import {
    ChevronRight, Shield, Smartphone, UserX, AlertCircle,
    UserCheck, X, KeyRound, Pencil
} from 'lucide-react'
import ManualMarkPresent from './ManualMarkPresent'
import EditMemberModal from './EditMemberModal'
import api from '../../services/api'
import { SearchBar } from '../common/SearchBar'
import { ROLES } from '../../constants'

const FONT = "'Plus Jakarta Sans', sans-serif"

// Full-width stacked button, left aligned
const btn = (bg, color, extra = {}) => ({
    background: bg, border: 'none', borderRadius: '10px',
    padding: '10px 14px', cursor: 'pointer', display: 'flex',
    alignItems: 'center', gap: '8px',
    fontSize: '0.78rem', fontWeight: 600, color, width: '100%',
    fontFamily: FONT, ...extra
})

const labelStyle = {
    fontSize: '0.68rem', fontWeight: 600, color: '#4a5e52',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px'
}

const selectStyle = {
    width: '100%', background: '#ffffff', border: '1px solid #e8ece9',
    borderRadius: '10px', padding: '10px 12px', fontSize: '0.82rem',
    color: '#0d1b12', outline: 'none', appearance: 'none', fontFamily: FONT
}

const sectionHead = {
    fontSize: '0.72rem', fontWeight: 700, color: '#8fa396',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    margin: '12px 0 8px 4px'
}

const Badge = ({ bg, color, children }) => (
    <span style={{
        background: bg, color, fontSize: '0.6rem', fontWeight: 700,
        padding: '2px 6px', borderRadius: '6px'
    }}>
        {children}
    </span>
)

const Notice = ({ type, children }) => {
    const isError = type === 'error'
    const color = isError ? '#e53e3e' : '#008751'
    return (
        <div style={{
            background: isError ? '#fff0f0' : '#e6f4ee', color,
            fontSize: '0.72rem', padding: '8px 10px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', gap: '6px'
        }}>
            <AlertCircle size={12} color={color} />
            {children}
        </div>
    )
}

const Avatar = ({ member, bg, color }) => (
    <div style={{
        width: '40px', height: '40px', borderRadius: '50%', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '0.78rem', color, flexShrink: 0
    }}>
        {member.first_name[0]}{member.last_name[0]}
    </div>
)

const rowStyle = (open) => ({
    background: '#ffffff',
    borderRadius: open ? '14px 14px 0 0' : '14px',
    padding: '14px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
    border: open ? '2px solid #008751' : '2px solid transparent',
    borderBottom: open ? 'none' : '2px solid transparent'
})

const panelStyle = {
    background: '#f8fdf9', border: '2px solid #008751', borderTop: 'none',
    borderRadius: '0 0 14px 14px', padding: '16px', marginBottom: '8px'
}

const Chevron = ({ open }) => (
    <ChevronRight
        size={16} color="#8fa396"
        style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform 0.2s', flexShrink: 0
        }}
    />
)

export default function MembersTab({
    members, streams = [], search, setSearch, loading,
    selectedMember, setSelectedMember,
    onRoleUpdate, onToggleDev, onResetDevice,
    onDeactivate, onMemberUpdated, currentMemberId
}) {
    // ── DERIVED DATA ────────────────────────────────────────────
    const devCount = members.filter(m => m.is_dev).length
    const maxDevsReached = devCount >= 2

    const staffMembers = members.filter(m => m.member_type === 'staff')
    const corpsMembers = members.filter(m => m.member_type === 'corps_member')

    const q = search.toLowerCase()
    const filtered = corpsMembers.filter(m =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
        m.state_code.toLowerCase().includes(q)
    )

    const takenRoles = {}
    members.forEach(m => {
        if (m.role && m.role !== 'member') {
            takenRoles[m.role] = `${m.first_name} ${m.last_name}`
        }
    })

    // ── UI STATE ────────────────────────────────────────────────
    const [roleErrors, setRoleErrors] = useState({})
    const [devErrors, setDevErrors] = useState({})
    const [notices, setNotices] = useState({})
    const [actionLoading, setActionLoading] = useState({})
    const [localSuspensions, setLocalSuspensions] = useState({})
    const [markPresentMember, setMarkPresentMember] = useState(null)
    const [editingMember, setEditingMember] = useState(null)

    const setLoadingKey = (key, value) =>
        setActionLoading(prev => ({ ...prev, [key]: value }))

    const setNotice = (id, type, text) =>
        setNotices(prev => ({ ...prev, [id]: { type, text } }))

    const errorText = (err, fallback) => err.response?.data?.message || fallback

    // ── HANDLERS ────────────────────────────────────────────────
    const handleRoleUpdate = async (id, role) => {
        setLoadingKey(`role_${id}`, true)
        setRoleErrors(prev => ({ ...prev, [id]: '' }))
        try {
            await onRoleUpdate(id, role)
        } catch (err) {
            setRoleErrors(prev => ({ ...prev, [id]: errorText(err, 'Failed to update role') }))
        } finally {
            setLoadingKey(`role_${id}`, false)
        }
    }

    const handleToggleDev = async (id) => {
        setLoadingKey(`dev_${id}`, true)
        setDevErrors(prev => ({ ...prev, [id]: '' }))
        try {
            await onToggleDev(id)
        } catch (err) {
            setDevErrors(prev => ({ ...prev, [id]: errorText(err, 'Failed to update dev access') }))
        } finally {
            setLoadingKey(`dev_${id}`, false)
        }
    }

    const handleResetDevice = async (id) => {
        setLoadingKey(`device_${id}`, true)
        try {
            await onResetDevice(id)
        } finally {
            setLoadingKey(`device_${id}`, false)
        }
    }

    const handleResetPin = async (m) => {
        if (!window.confirm(`Email ${m.first_name} a new PIN?`)) return
        setLoadingKey(`pin_${m.id}`, true)
        try {
            await api.post(`/members/${m.id}/reset-pin`)
            setNotice(m.id, 'success', 'New PIN emailed to the member.')
        } catch (err) {
            setNotice(m.id, 'error', errorText(err, 'Reset failed'))
        } finally {
            setLoadingKey(`pin_${m.id}`, false)
        }
    }

    const handleReinstate = async (m) => {
        setLoadingKey(`reinstate_${m.id}`, true)
        try {
            await api.post('/attendance/reinstate', { memberId: m.id })
            setLocalSuspensions(prev => ({ ...prev, [m.id]: { is_suspended: false } }))
            setNotice(m.id, 'success', 'Member reinstated.')
        } catch (err) {
            setNotice(m.id, 'error', errorText(err, 'Reinstatement failed'))
        } finally {
            setLoadingKey(`reinstate_${m.id}`, false)
        }
    }

    const handleDeactivate = (m) => {
        if (window.confirm(`Deactivate ${m.first_name} ${m.last_name}?`)) {
            onDeactivate(m.id)
        }
    }

    // ── RENDER ──────────────────────────────────────────────────
    return (
        <>
            {maxDevsReached && (
                <div style={{
                    background: '#fff8e6', borderRadius: '12px', padding: '10px 14px',
                    fontSize: '0.75rem', color: '#d4900a', fontWeight: 500,
                    marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                    <AlertCircle size={14} color="#d4900a" />
                    Maximum 2 devs reached. Remove a dev to assign another.
                </div>
            )}

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by name or state code"
            />

            {loading && (
                <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '40px 0' }}>
                    Loading...
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div style={{
                    background: '#ffffff', borderRadius: '14px', padding: '30px',
                    textAlign: 'center', color: '#8fa396', fontSize: '0.82rem',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                }}>
                    {search ? `No results for "${search}"` : 'No members found'}
                </div>
            )}

            {/* ── STAFF ── */}
            {staffMembers.length > 0 && !search && (
                <>
                    <div style={sectionHead}>Staff</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {staffMembers.map(m => {
                            const open = selectedMember?.id === m.id
                            return (
                                <div key={m.id}>
                                    <div onClick={() => setSelectedMember(open ? null : m)} style={rowStyle(open)}>
                                        <Avatar member={m} bg="#eef2ff" color="#4f46e5" />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                flexWrap: 'wrap', marginBottom: '2px'
                                            }}>
                                                <span>{m.first_name} {m.last_name}</span>
                                                <Badge bg="#eef2ff" color="#4f46e5">STAFF</Badge>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>Coordinator</div>
                                        </div>
                                        <Chevron open={open} />
                                    </div>

                                    {open && (
                                        <div style={panelStyle}>
                                            <button
                                                onClick={() => handleResetDevice(m.id)}
                                                disabled={actionLoading[`device_${m.id}`]}
                                                style={btn('#f2f4f7', '#4a5e52', {
                                                    opacity: actionLoading[`device_${m.id}`] ? 0.6 : 1
                                                })}
                                            >
                                                <Smartphone size={14} color="#4a5e52" />
                                                {actionLoading[`device_${m.id}`] ? 'Resetting...' : 'Reset Device'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div style={sectionHead}>Corps Members</div>
                </>
            )}

            {/* ── CORPS MEMBERS ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered.map(m => {
                    const open = selectedMember?.id === m.id
                    const isSuspended = localSuspensions[m.id]?.is_suspended ?? m.is_suspended
                    const notice = notices[m.id]
                    const isSelf = m.id === currentMemberId

                    return (
                        <div key={m.id}>
                            {/* ROW */}
                            <div onClick={() => setSelectedMember(open ? null : m)} style={rowStyle(open)}>
                                <Avatar
                                    member={m}
                                    bg={m.is_active ? '#e6f4ee' : '#f2f4f7'}
                                    color={m.is_active ? '#008751' : '#8fa396'}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '0.85rem', fontWeight: 600,
                                        color: m.is_active ? '#0d1b12' : '#8fa396',
                                        marginBottom: '2px', display: 'flex',
                                        alignItems: 'center', gap: '6px', flexWrap: 'wrap'
                                    }}>
                                        <span>{m.first_name} {m.last_name}</span>
                                        {m.is_dev && <Badge bg="#eef2ff" color="#4f46e5">DEV</Badge>}
                                        {!m.is_active && <Badge bg="#fff0f0" color="#e53e3e">INACTIVE</Badge>}
                                        {isSuspended && (
                                            <Badge bg="#fff0f0" color="#e53e3e">
                                                SUSPENDED{m.reinstatement_count > 0 ? ` (×${m.reinstatement_count + 1})` : ''}
                                            </Badge>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                        {m.state_code} · {m.role?.replace('_', ' ')}
                                        {m.stream_year ? ` · ${m.stream_year} Batch ${m.stream_batch}` : ''}
                                    </div>
                                </div>
                                <Chevron open={open} />
                            </div>

                            {/* EXPANDED PANEL — all buttons stacked */}
                            {open && (
                                <div style={panelStyle}>
                                    {notice && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <Notice type={notice.type}>{notice.text}</Notice>
                                        </div>
                                    )}

                                    {/* ROLE */}
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={labelStyle}>Role</div>
                                        {roleErrors[m.id] && (
                                            <div style={{ marginBottom: '8px' }}>
                                                <Notice type="error">{roleErrors[m.id]}</Notice>
                                            </div>
                                        )}
                                        <select
                                            value={m.role}
                                            onChange={e => handleRoleUpdate(m.id, e.target.value)}
                                            disabled={actionLoading[`role_${m.id}`]}
                                            style={{ ...selectStyle, opacity: actionLoading[`role_${m.id}`] ? 0.6 : 1 }}
                                        >
                                            {ROLES.map(role => {
                                                const isTaken = takenRoles[role] &&
                                                    takenRoles[role] !== `${m.first_name} ${m.last_name}`
                                                return (
                                                    <option key={role} value={role} disabled={isTaken}>
                                                        {role.replace('_', ' ')}
                                                        {isTaken ? ` — taken by ${takenRoles[role]}` : ''}
                                                    </option>
                                                )
                                            })}
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {/* EDIT DETAILS */}
                                        <button
                                            onClick={() => setEditingMember(m)}
                                            style={btn('#eaf2fb', '#2b6cb0')}
                                        >
                                            <Pencil size={14} color="#2b6cb0" />
                                            Edit Details
                                        </button>

                                        {/* TOGGLE DEV */}
                                        {!isSelf && (
                                            <>
                                                {devErrors[m.id] && <Notice type="error">{devErrors[m.id]}</Notice>}
                                                <button
                                                    onClick={() => handleToggleDev(m.id)}
                                                    disabled={actionLoading[`dev_${m.id}`] || (!m.is_dev && maxDevsReached)}
                                                    style={btn(
                                                        m.is_dev ? '#fff8e6' : '#eef2ff',
                                                        m.is_dev ? '#d4900a' : '#4f46e5',
                                                        { opacity: (!m.is_dev && maxDevsReached) ? 0.5 : 1 }
                                                    )}
                                                >
                                                    <Shield size={14} color={m.is_dev ? '#d4900a' : '#4f46e5'} />
                                                    {actionLoading[`dev_${m.id}`] ? 'Updating...'
                                                        : m.is_dev ? 'Remove Dev Access'
                                                        : maxDevsReached ? 'Dev limit reached (2/2)'
                                                        : 'Grant Dev Access'}
                                                </button>
                                            </>
                                        )}

                                        {/* RESET DEVICE */}
                                        <button
                                            onClick={() => handleResetDevice(m.id)}
                                            disabled={actionLoading[`device_${m.id}`]}
                                            style={btn('#f2f4f7', '#4a5e52', {
                                                opacity: actionLoading[`device_${m.id}`] ? 0.6 : 1
                                            })}
                                        >
                                            <Smartphone size={14} color="#4a5e52" />
                                            {actionLoading[`device_${m.id}`] ? 'Resetting...' : 'Reset Device'}
                                        </button>

                                        {/* RESET PIN */}
                                        <button
                                            onClick={() => handleResetPin(m)}
                                            disabled={actionLoading[`pin_${m.id}`]}
                                            style={btn('#fff8e6', '#d4900a', {
                                                opacity: actionLoading[`pin_${m.id}`] ? 0.6 : 1
                                            })}
                                        >
                                            <KeyRound size={14} color="#d4900a" />
                                            {actionLoading[`pin_${m.id}`] ? 'Sending...' : 'Reset PIN'}
                                        </button>

                                        {/* MARK PRESENT */}
                                        {!isSelf && m.is_active && (
                                            <button
                                                onClick={() => setMarkPresentMember(m)}
                                                style={btn('#e6f4ee', '#008751')}
                                            >
                                                <UserCheck size={14} color="#008751" />
                                                Mark Member Present
                                            </button>
                                        )}

                                        {/* REINSTATE */}
                                        {isSuspended && !isSelf && (
                                            <button
                                                onClick={() => handleReinstate(m)}
                                                disabled={actionLoading[`reinstate_${m.id}`]}
                                                style={btn('#fff8e6', '#d4900a', {
                                                    border: '1px solid #d4900a',
                                                    opacity: actionLoading[`reinstate_${m.id}`] ? 0.6 : 1
                                                })}
                                            >
                                                <UserCheck size={14} color="#d4900a" />
                                                {actionLoading[`reinstate_${m.id}`] ? 'Reinstating...' : 'Reinstate Member'}
                                            </button>
                                        )}

                                        {/* DEACTIVATE */}
                                        {m.is_active && !isSelf && (
                                            <button
                                                onClick={() => handleDeactivate(m)}
                                                style={btn('#fff0f0', '#e53e3e')}
                                            >
                                                <UserX size={14} color="#e53e3e" />
                                                Deactivate Member
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* ── EDIT DETAILS MODAL ── */}
            {editingMember && (
                <EditMemberModal
                    member={editingMember}
                    streams={streams}
                    onClose={() => setEditingMember(null)}
                    onSaved={(updated) => {
                        onMemberUpdated?.(updated)
                        setNotice(updated.id, 'success', 'Details updated.')
                    }}
                />
            )}

            {/* ── MARK PRESENT MODAL ── */}
            {markPresentMember && (
                <div
                    onClick={() => setMarkPresentMember(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: '20px', boxSizing: 'border-box'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#ffffff', borderRadius: '16px', padding: '20px',
                            width: '100%', maxWidth: '400px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                        }}
                    >
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', marginBottom: '14px'
                        }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12' }}>
                                Mark {markPresentMember.first_name} {markPresentMember.last_name} Present
                            </span>
                            <button
                                onClick={() => setMarkPresentMember(null)}
                                style={{
                                    background: '#f2f4f7', border: 'none', borderRadius: '50%',
                                    width: '28px', height: '28px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                <X size={14} color="#4a5e52" />
                            </button>
                        </div>
                        <ManualMarkPresent
                            member={markPresentMember}
                            onSuccess={() => setMarkPresentMember(null)}
                        />
                    </div>
                </div>
            )}
        </>
    )
}