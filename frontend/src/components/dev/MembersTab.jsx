import { useState, useEffect } from 'react'
import { Users, ChevronRight, Shield, Smartphone, UserX, AlertCircle, UserCheck, X } from 'lucide-react'
import ManualMarkPresent from './ManualMarkPresent'
import api from '../../services/api'
import { ROLES } from '../../constants'

export default function MembersTab({
    members, search, setSearch, loading,
    selectedMember, setSelectedMember,
    onRoleUpdate, onToggleDev, onResetDevice,
    onDeactivate, currentMemberId
}) {
    const devCount = members.filter(m => m.is_dev).length
    const maxDevsReached = devCount >= 2

    // Build a map of which roles are already taken
    const takenRoles = {}
    members.forEach(m => {
        if (m.role && m.role !== 'member') {
            takenRoles[m.role] = `${m.first_name} ${m.last_name}`
        }
    })

    const [roleErrors, setRoleErrors] = useState({})
    const [devErrors, setDevErrors] = useState({})
    const [actionLoading, setActionLoading] = useState({})

    const [suspensions, setSuspensions] = useState({})
    
    // State to handle the Mark Present Modal
    const [markPresentMember, setMarkPresentMember] = useState(null)

    useEffect(() => {
        const checkSuspensions = async () => {
            const results = {}
            await Promise.all(
                members.map(async (m) => {
                    try {
                        const res = await api.get(`/attendance/suspension/${m.id}`)
                        results[m.id] = res.data.data
                    } catch (err) {}
                })
            )
            setSuspensions(results)
        }
        if (members.length > 0) checkSuspensions()
    }, [members])

    const handleRoleUpdate = async (memberId, role) => {
        setActionLoading(prev => ({ ...prev, [`role_${memberId}`]: true }))
        setRoleErrors(prev => ({ ...prev, [memberId]: '' }))
        try {
            await onRoleUpdate(memberId, role)
        } catch (err) {
            setRoleErrors(prev => ({
                ...prev,
                [memberId]: err.response?.data?.message || 'Failed to update role'
            }))
        } finally {
            setActionLoading(prev => ({ ...prev, [`role_${memberId}`]: false }))
        }
    }

    const handleToggleDev = async (memberId) => {
        setActionLoading(prev => ({ ...prev, [`dev_${memberId}`]: true }))
        setDevErrors(prev => ({ ...prev, [memberId]: '' }))
        try {
            await onToggleDev(memberId)
        } catch (err) {
            setDevErrors(prev => ({
                ...prev,
                [memberId]: err.response?.data?.message || 'Failed to update dev access'
            }))
        } finally {
            setActionLoading(prev => ({ ...prev, [`dev_${memberId}`]: false }))
        }
    }

    return (
        <>
            {/* DEV LIMIT WARNING */}
            {maxDevsReached && (
                <div style={{
                    background: '#fff8e6',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '0.75rem',
                    color: '#d4900a',
                    fontWeight: 500,
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <AlertCircle size={14} color="#d4900a" />
                    Maximum 2 devs reached. Remove a dev to assign another.
                </div>
            )}

            {/* SEARCH */}
            <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '12px 16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px'
            }}>
                <Users size={16} color="#8fa396" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or state code"
                    style={{
                        flex: 1, border: 'none', outline: 'none',
                        fontSize: '0.85rem', color: '#0d1b12',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        background: 'transparent'
                    }}
                />
            </div>

            {loading && (
                <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '40px 0' }}>
                    Loading...
                </div>
            )}

            {!loading && members.length === 0 && (
                <div style={{
                    background: '#ffffff', borderRadius: '14px',
                    padding: '30px', textAlign: 'center',
                    color: '#8fa396', fontSize: '0.82rem',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                }}>
                    No members found
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {members.map(m => (
                    <div key={m.id}>
                        {/* MEMBER ROW */}
                        <div
                            onClick={() => setSelectedMember(selectedMember?.id === m.id ? null : m)}
                            style={{
                                background: '#ffffff',
                                borderRadius: selectedMember?.id === m.id ? '14px 14px 0 0' : '14px',
                                padding: '14px 16px',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                border: selectedMember?.id === m.id
                                    ? '2px solid #008751'
                                    : '2px solid transparent',
                                borderBottom: selectedMember?.id === m.id ? 'none' : '2px solid transparent'
                            }}
                        >
                            {/* AVATAR */}
                            <div style={{
                                width: '40px', height: '40px',
                                borderRadius: '50%',
                                background: m.is_active ? '#e6f4ee' : '#f2f4f7',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.78rem',
                                color: m.is_active ? '#008751' : '#8fa396',
                                flexShrink: 0
                            }}>
                                {m.first_name[0]}{m.last_name[0]}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '0.85rem', fontWeight: 600,
                                    color: m.is_active ? '#0d1b12' : '#8fa396',
                                    marginBottom: '2px',
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                }}>
                                    {m.first_name} {m.last_name}
                                    {m.is_dev && (
                                        <span style={{
                                            background: '#eef2ff', color: '#4f46e5',
                                            fontSize: '0.6rem', fontWeight: 700,
                                            padding: '2px 6px', borderRadius: '6px'
                                        }}>
                                            DEV
                                        </span>
                                    )}
                                    {!m.is_active && (
                                        <span style={{
                                            background: '#fff0f0', color: '#e53e3e',
                                            fontSize: '0.6rem', fontWeight: 700,
                                            padding: '2px 6px', borderRadius: '6px'
                                        }}>
                                            INACTIVE
                                        </span>
                                    )}
                                    {suspensions[m.id]?.is_suspended && (
                                        <span style={{
                                            background: '#fff0f0', color: '#e53e3e',
                                            fontSize: '0.6rem', fontWeight: 700,
                                            padding: '2px 6px', borderRadius: '6px'
                                        }}>
                                            SUSPENDED {m.reinstatement_count > 0 ? `(×${m.reinstatement_count + 1})` : ''}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                    {m.state_code} · {m.role?.replace('_', ' ')}
                                    {m.stream_year ? ` · ${m.stream_year} Batch ${m.stream_batch}` : ''}
                                </div>
                            </div>

                            <ChevronRight
                                size={16}
                                color="#8fa396"
                                style={{
                                    transform: selectedMember?.id === m.id ? 'rotate(90deg)' : 'rotate(0)',
                                    transition: 'transform 0.2s'
                                }}
                            />
                        </div>

                        {/* EXPANDED ACTIONS */}
                        {selectedMember?.id === m.id && (
                            <div style={{
                                background: '#f8fdf9',
                                border: '2px solid #008751',
                                borderTop: 'none',
                                borderRadius: '0 0 14px 14px',
                                padding: '16px',
                                marginBottom: '8px'
                            }}>

                                {/* ROLE SELECTOR */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{
                                        fontSize: '0.68rem', fontWeight: 600,
                                        color: '#4a5e52', textTransform: 'uppercase',
                                        letterSpacing: '0.5px', marginBottom: '6px'
                                    }}>
                                        Role
                                    </div>

                                    {roleErrors[m.id] && (
                                        <div style={{
                                            background: '#fff0f0', color: '#e53e3e',
                                            fontSize: '0.72rem', padding: '8px 10px',
                                            borderRadius: '8px', marginBottom: '8px',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <AlertCircle size={12} color="#e53e3e" />
                                            {roleErrors[m.id]}
                                        </div>
                                    )}

                                    <select
                                        value={m.role}
                                        onChange={async (e) => {
                                            await handleRoleUpdate(m.id, e.target.value)
                                        }}
                                        disabled={actionLoading[`role_${m.id}`]}
                                        style={{
                                            width: '100%',
                                            background: '#ffffff',
                                            border: '1px solid #e8ece9',
                                            borderRadius: '10px',
                                            padding: '10px 12px',
                                            fontSize: '0.82rem',
                                            color: '#0d1b12',
                                            outline: 'none',
                                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                                            appearance: 'none',
                                            opacity: actionLoading[`role_${m.id}`] ? 0.6 : 1
                                        }}
                                    >
                                        {ROLES.map(role => {
                                            const isTaken = takenRoles[role] && takenRoles[role] !== `${m.first_name} ${m.last_name}`
                                            return (
                                                <option
                                                    key={role}
                                                    value={role}
                                                    disabled={isTaken}
                                                >
                                                    {role.replace('_', ' ')}
                                                    {isTaken ? ` — taken by ${takenRoles[role]}` : ''}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                                    {/* TOGGLE DEV */}
                                    {m.id !== currentMemberId && (
                                        <>
                                            {devErrors[m.id] && (
                                                <div style={{
                                                    background: '#fff0f0', color: '#e53e3e',
                                                    fontSize: '0.72rem', padding: '8px 10px',
                                                    borderRadius: '8px',
                                                    display: 'flex', alignItems: 'center', gap: '6px'
                                                }}>
                                                    <AlertCircle size={12} color="#e53e3e" />
                                                    {devErrors[m.id]}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleToggleDev(m.id)}
                                                disabled={
                                                    actionLoading[`dev_${m.id}`] ||
                                                    (!m.is_dev && maxDevsReached)
                                                }
                                                style={{
                                                    background: m.is_dev ? '#fff8e6' : '#eef2ff',
                                                    border: 'none', borderRadius: '10px',
                                                    padding: '10px 14px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center',
                                                    gap: '8px', fontSize: '0.78rem',
                                                    fontWeight: 600,
                                                    color: m.is_dev ? '#d4900a' : '#4f46e5',
                                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                    width: '100%',
                                                    opacity: (!m.is_dev && maxDevsReached) ? 0.5 : 1
                                                }}
                                            >
                                                <Shield size={14} color={m.is_dev ? '#d4900a' : '#4f46e5'} />
                                                {actionLoading[`dev_${m.id}`]
                                                    ? 'Updating...'
                                                    : m.is_dev
                                                        ? 'Remove Dev Access'
                                                        : maxDevsReached
                                                            ? 'Dev limit reached (2/2)'
                                                            : 'Grant Dev Access'
                                                }
                                            </button>
                                        </>
                                    )}

                                    {/* RESET DEVICE */}
                                    <button
                                        onClick={async () => {
                                            setActionLoading(prev => ({ ...prev, [`device_${m.id}`]: true }))
                                            try {
                                                await onResetDevice(m.id)
                                            } finally {
                                                setActionLoading(prev => ({ ...prev, [`device_${m.id}`]: false }))
                                            }
                                        }}
                                        disabled={actionLoading[`device_${m.id}`]}
                                        style={{
                                            background: '#f2f4f7', border: 'none',
                                            borderRadius: '10px', padding: '10px 14px',
                                            cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', gap: '8px',
                                            fontSize: '0.78rem', fontWeight: 600,
                                            color: '#4a5e52',
                                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                                            width: '100%',
                                            opacity: actionLoading[`device_${m.id}`] ? 0.6 : 1
                                        }}
                                    >
                                        <Smartphone size={14} color="#4a5e52" />
                                        {actionLoading[`device_${m.id}`] ? 'Resetting...' : 'Reset Device'}
                                    </button>

                                    {/* DEACTIVATE */}
                                    {m.is_active && m.id !== currentMemberId && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Deactivate ${m.first_name} ${m.last_name}?`)) {
                                                    onDeactivate(m.id)
                                                }
                                            }}
                                            style={{
                                                background: '#fff0f0', border: 'none',
                                                borderRadius: '10px', padding: '10px 14px',
                                                cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', gap: '8px',
                                                fontSize: '0.78rem', fontWeight: 600,
                                                color: '#e53e3e',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                width: '100%'
                                            }}
                                        >
                                            <UserX size={14} color="#e53e3e" />
                                            Deactivate Member
                                        </button>
                                    )}

                                    {/* REINSTATE SUSPENDED MEMBER */}
                                    {suspensions[m.id]?.is_suspended && m.id !== currentMemberId && (
                                        <button
                                            onClick={async () => {
                                                setActionLoading(prev => ({ ...prev, [`reinstate_${m.id}`]: true }))
                                                try {
                                                    await api.post('/attendance/reinstate', { memberId: m.id })
                                                    setSuspensions(prev => ({
                                                        ...prev,
                                                        [m.id]: { is_suspended: false, missed_meeting: null }
                                                    }))
                                                } catch (err) {
                                                    console.error(err)
                                                } finally {
                                                    setActionLoading(prev => ({ ...prev, [`reinstate_${m.id}`]: false }))
                                                }
                                            }}
                                            disabled={actionLoading[`reinstate_${m.id}`]}
                                            style={{
                                                background: '#e6f4ee', border: 'none',
                                                borderRadius: '10px', padding: '10px 14px',
                                                cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', gap: '8px',
                                                fontSize: '0.78rem', fontWeight: 600,
                                                color: '#008751',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                width: '100%',
                                                opacity: actionLoading[`reinstate_${m.id}`] ? 0.6 : 1
                                            }}
                                        >
                                            <UserCheck size={14} color="#008751" />
                                            {actionLoading[`reinstate_${m.id}`] ? 'Reinstating...' : 'Reinstate Member'}
                                        </button>
                                    )}

                                    {/* MARK PRESENT BUTTON */}
                                    {m.id !== currentMemberId && m.is_active && (
                                        <button
                                            onClick={() => setMarkPresentMember(m)}
                                            style={{
                                                background: '#e6f4ee', border: 'none',
                                                borderRadius: '10px', padding: '10px 14px',
                                                cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', gap: '8px',
                                                fontSize: '0.78rem', fontWeight: 600,
                                                color: '#008751',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                width: '100%'
                                            }}
                                        >
                                            <UserCheck size={14} color="#008751" />
                                            Mark Member Present
                                        </button>
                                    )}

                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* MARK PRESENT MODAL */}
            {markPresentMember && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '16px'
                }}>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        width: '100%',
                        maxWidth: '440px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        position: 'relative'
                    }}>
                        <div style={{
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: '#0d1b12',
                                margin: 0
                            }}>
                                Mark Present: {markPresentMember.first_name} {markPresentMember.last_name}
                            </h3>
                            <button
                                onClick={() => setMarkPresentMember(null)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={18} color="#8fa396" />
                            </button>
                        </div>

                        <ManualMarkPresent
                            member={markPresentMember}
                            onSuccess={() => {
                                setMarkPresentMember(null)
                                setSelectedMember(null)
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    )
}