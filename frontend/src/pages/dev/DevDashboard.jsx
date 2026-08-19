import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Users, Calendar, Layers, Settings } from 'lucide-react'
import {
    getAllMembers, updateMemberRole, toggleDevAccess,
    resetMemberDevice, deactivateMember,
    getAllMeetings, getAllStreams, createStream, toggleStreamActive,
    getRegistrationStatus, toggleRegistration
} from '../../services/dev.service'


import MeetingsTab from '../../components/dev/MeetingsTab'
import MembersTab from '../../components/dev/MembersTab'
import SettingsTab from '../../components/dev/SettingsTab'
import StreamsTab from '../../components/dev/StreamsTab'


export default function DevDashboard() {
    const { member } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('members')
    const [members, setMembers] = useState([])
    const [meetings, setMeetings] = useState([])
    const [streams, setStreams] = useState([])
    const [regStatus, setRegStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedMember, setSelectedMember] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [membersRes, meetingsRes, streamsRes, regRes] = await Promise.all([
                getAllMembers(),
                getAllMeetings(),
                getAllStreams(),
                getRegistrationStatus()
            ])
            setMembers(membersRes.data)
            setMeetings(meetingsRes.data)
            setStreams(streamsRes.data)
            setRegStatus(regRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const filtered = members.filter(m =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        m.state_code.toLowerCase().includes(search.toLowerCase())
    )

    const sectionHead = {
        fontSize: '0.75rem', fontWeight: 700, color: '#8fa396',
        textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px'
    }

    const card = {
        background: '#ffffff', borderRadius: '14px', padding: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '10px'
    }

    const inputStyle = {
        width: '100%', background: '#f2f4f7', border: 'none', borderRadius: '12px',
        padding: '12px 14px', fontSize: '0.85rem', color: '#0d1b12', outline: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '10px'
    }

    const tabs = [
        { key: 'members', label: 'Members', icon: Users },
        { key: 'meetings', label: 'Meetings', icon: Calendar },
        { key: 'streams', label: 'Streams', icon: Layers },
        { key: 'settings', label: 'Settings', icon: Settings }
    ]

    return (
        <div style={{
            minHeight: '100vh', background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: '390px',
            margin: '0 auto', paddingBottom: '90px'
        }}>
            {/* HEADER */}
            <div style={{ background: '#ffffff', padding: '52px 20px 16px' }}>
                <div style={{ fontSize: '0.78rem', color: '#8fa396', marginBottom: '2px' }}>
                    Dev Panel
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d1b12' }}>
                    <span style={{ color: '#008751' }}>🛠️</span> CDSConnect
                </div>
            </div>

            <div style={{ padding: '16px 20px 0' }}>
                {activeTab === 'members' && (
                    <MembersTab
                        members={filtered} search={search} setSearch={setSearch}
                        loading={loading} selectedMember={selectedMember} setSelectedMember={setSelectedMember}
                        onRoleUpdate={async (memberId, role) => {
                            await updateMemberRole(memberId, role)
                            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m))
                        }}
                        onToggleDev={async (memberId) => {
                            const result = await toggleDevAccess(memberId)
                            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, is_dev: result.data.is_dev } : m))
                        }}
                        onResetDevice={async (memberId) => {
                            await resetMemberDevice(memberId)
                            alert('Device reset successfully')
                        }}
                        onDeactivate={async (memberId) => {
                            await deactivateMember(memberId)
                            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, is_active: false } : m))
                        }}
                        currentMemberId={member?.id}
                    />
                )}

                {activeTab === 'meetings' && (
                    <MeetingsTab
                        meetings={meetings} inputStyle={inputStyle}
                        sectionHead={sectionHead} card={card}
                        onCreated={(meeting) => setMeetings(prev => [meeting, ...prev])}
                    />
                )}

                {activeTab === 'streams' && (
                    <StreamsTab
                        streams={streams} inputStyle={inputStyle}
                        sectionHead={sectionHead} card={card}
                        onCreated={(stream) => setStreams(prev => [stream, ...prev])}
                        onToggle={async (streamId) => {
                            const result = await toggleStreamActive(streamId)
                            setStreams(prev => prev.map(s => s.id === streamId ? result.data : s))
                        }}
                    />
                )}

                {activeTab === 'settings' && (
                    <SettingsTab
                        regStatus={regStatus} card={card} sectionHead={sectionHead}
                        onToggle={async () => {
                            const result = await toggleRegistration()
                            setRegStatus(prev => ({
                                ...prev,
                                registration_open: result.data.registration_open
                            }))
                        }}
                    />
                )}
            </div>

            {/* BOTTOM NAV */}
            <nav style={{
                position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: '390px', background: '#ffffff',
                borderTop: '1px solid #e8ece9', display: 'flex', padding: '10px 0 24px',
                zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
            }}>
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.key
                    return (
                        <div
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                        >
                            <div style={{
                                width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', background: isActive ? '#e6f4ee' : 'transparent', borderRadius: '8px'
                            }}>
                                <Icon size={18} color={isActive ? '#008751' : '#8fa396'} />
                            </div>
                            <div style={{
                                fontSize: '0.58rem', fontWeight: 600, color: isActive ? '#008751' : '#8fa396',
                                textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>
                                {tab.label}
                            </div>
                        </div>
                    )
                })}
            </nav>
        </div>
    )
}
