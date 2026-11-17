import Avatar from './Avatar'
import { card } from '../tokens/styles'

const roleLabel = (r) => r.replace(/_/g, ' ')

const NOTE = {
    vacant: 'No candidates, so this position stays vacant',
    unopposed: 'Elected unopposed',
    tie: 'Tie. The dev will settle it',
    no_result: 'No votes were cast',
    decided: null
}

export default function ResultsView({ results }) {
    const { turnout, positions } = results
    const percent = turnout.eligible ? Math.round((turnout.voted / turnout.eligible) * 100) : null

    return (
        <>
            <div style={{ ...card, background: '#f8fdf9', marginBottom: '14px', fontSize: '0.78rem', color: '#4a5e52', lineHeight: 1.6 }}>
                <b style={{ color: '#0d1b12' }}>The election is closed.</b>
                {turnout.eligible ? ` ${turnout.voted} of ${turnout.eligible} members voted (${percent}%).` : ''}
                {' '}These results stay visible until the end of today.
            </div>

            {positions.map(p => (
                <div key={p.role} style={{ ...card, marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d1b12', textTransform: 'capitalize', marginBottom: '4px' }}>
                        {roleLabel(p.role)}
                    </div>
                    {NOTE[p.status] && (
                        <div style={{ fontSize: '0.75rem', color: p.status === 'tie' ? '#d4900a' : '#8fa396', marginBottom: '8px' }}>{NOTE[p.status]}</div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {p.candidates.map(c => (
                            <div key={c.id}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: c.percent !== null ? '6px' : 0 }}>
                                    <Avatar name={c.name} size={36} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1b12' }}>{c.name}</div>
                                        <div style={{ fontSize: '0.68rem', color: '#8fa396' }}>{c.state_code}</div>
                                    </div>
                                    {c.winner && (
                                        <span style={{ background: '#e6f4ee', color: '#008751', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: '10px' }}>
                                            {p.status === 'tie' ? 'TIED' : 'WINNER'}
                                        </span>
                                    )}
                                    {c.votes !== null && (
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0d1b12' }}>
                                            {c.votes} <span style={{ color: '#8fa396', fontWeight: 600 }}>({c.percent ?? 0}%)</span>
                                        </span>
                                    )}
                                </div>
                                {c.percent !== null && (
                                    <div style={{ height: '6px', background: '#f2f4f7', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${c.percent}%`, height: '100%', background: c.winner ? '#008751' : '#c2e0cf' }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </>
    )
}