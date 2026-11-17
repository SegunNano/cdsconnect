import { useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft, Vote } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import useElection from '../../hooks/useElection'
import ApplicationPanel from '../../components/election/ApplicationPanel'
import CandidateList from '../../components/election/CandidateList'
import ResultsView from '../../components/election/ResultsView'
import { FONT, card, errorBox } from '../../components/tokens/styles'

const CHIP = {
    applications: ['Applications open', '#008751', '#e6f4ee'],
    review: ['Applications closed', '#d4900a', '#fff8e6'],
    voting: ['Voting open', '#4f46e5', '#eef2ff'],
    closed: ['Closed', '#4a5e52', '#f2f4f7']
}

export default function Election() {
    const navigate = useNavigate()
    const { member } = useAuth()
    const { state, error, reload } = useElection()

    // The coordinator is staff and doesn't take part
    if (member && member.member_type !== 'corps_member') return <Navigate to="/" replace />

    const chip = state ? CHIP[state.status] : null

    return (
        <div style={{ minHeight: '100vh', background: '#f2f4f7', fontFamily: FONT, maxWidth: '390px', margin: '0 auto', paddingBottom: '100px' }}>
            <div style={{ background: '#ffffff', padding: '52px 20px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 0 #e8ece9' }}>
                <div
                    onClick={() => navigate('/')}
                    style={{ width: '36px', height: '36px', background: '#f2f4f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <ArrowLeft size={18} color="#4a5e52" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>Election</div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {state?.title || 'Vote for your executives'}
                    </div>
                </div>
                {chip && (
                    <span style={{ background: chip[2], color: chip[1], fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>
                        {chip[0]}
                    </span>
                )}
            </div>

            <div style={{ padding: '16px 20px 0' }}>
                {error && <div style={errorBox}>{error}</div>}

                {state === undefined && (
                    <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '40px 0' }}>Loading...</div>
                )}

                {state === null && !error && (
                    <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
                        <Vote size={32} color="#c2e0cf" style={{ marginBottom: '10px' }} />
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12', marginBottom: '4px' }}>No election right now</div>
                        <div style={{ fontSize: '0.75rem', color: '#8fa396' }}>You'll be notified when one opens.</div>
                    </div>
                )}

                {state?.status === 'applications' && <ApplicationPanel state={state} reload={reload} />}
                {state && ['review', 'voting'].includes(state.status) && <CandidateList state={state} onVoted={reload} />}
                {state?.status === 'closed' && <ResultsView results={state.results} />}
            </div>
        </div>
    )
}