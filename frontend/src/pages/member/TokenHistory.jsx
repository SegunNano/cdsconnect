import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Plus, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import useTokenWallet from '../../hooks/useTokenWallet'
import { cancelTopUpRequest } from '../../services/tokens.service'
import { DIRECT_TOPUP_ROLES } from '../../constants'
import Toast from '../../components/common/Toast'
import WalletSummary from '../../components/tokens/WalletSummary'
import RequestsPanel from '../../components/tokens/RequestsPanel'
import HistoryList from '../../components/tokens/HistoryList'
import BuyTokensModal from '../../components/tokens/BuyTokensModal'
import GiftTokensModal from '../../components/tokens/GiftTokensModal'
import { FONT, btn } from '../../components/tokens/styles'

export default function TokenHistory() {
    const navigate = useNavigate()
    const { member } = useAuth()
    const { history, requests, loading, reload } = useTokenWallet()
    const [modal, setModal] = useState(null)          // 'buy' | 'gift' | null
    const [cancellingId, setCancellingId] = useState(null)
    const [toast, setToast] = useState(null)

    const pending = requests.find(r => r.status === 'pending')
    // Treasurer and financial secretary top up directly, so they never buy by request
    const canBuy = !DIRECT_TOPUP_ROLES.includes(member?.role)

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this top-up request?')) return
        setCancellingId(id)
        try {
            await cancelTopUpRequest(id)
            await reload()
            setToast({ type: 'success', text: 'Request cancelled.' })
        } catch (err) {
            setToast({ type: 'error', text: err.response?.data?.message || 'Could not cancel the request.' })
        } finally {
            setCancellingId(null)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', background: '#f2f4f7', fontFamily: FONT,
            maxWidth: '390px', margin: '0 auto', paddingBottom: '100px'
        }}>
            <Toast message={toast?.text} type={toast?.type} onClose={() => setToast(null)} />

            {/* HEADER */}
            <div style={{
                background: '#ffffff', padding: '52px 20px 16px', display: 'flex',
                alignItems: 'center', gap: '12px', boxShadow: '0 1px 0 #e8ece9'
            }}>
                <div
                    onClick={() => navigate('/')}
                    style={{
                        width: '36px', height: '36px', background: '#f2f4f7', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={18} color="#4a5e52" />
                </div>
                <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>Tokens</div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>Balance, purchases and history</div>
                </div>
            </div>

            <div style={{ padding: '16px 20px 0' }}>
                <WalletSummary balance={member?.token_balance} history={history} />

                {/* ACTIONS */}
                <div style={{ display: 'grid', gridTemplateColumns: canBuy ? '1.4fr 1fr' : '1fr', gap: '10px', marginBottom: '16px' }}>
                    {canBuy && (
                        <button onClick={() => setModal('buy')} disabled={!!pending} style={btn('#008751', 'white', !!pending)}>
                            {pending ? <><Clock size={15} /> Request pending</> : <><Plus size={15} /> Buy Tokens</>}
                        </button>
                    )}
                    <button onClick={() => setModal('gift')} style={btn('#e6f4ee', '#008751')}>
                        <Send size={14} /> Gift
                    </button>
                </div>

                <RequestsPanel requests={requests} cancellingId={cancellingId} onCancel={handleCancel} />
                <HistoryList history={history} loading={loading} />
            </div>

            {modal === 'buy' && <BuyTokensModal onClose={() => setModal(null)} onSubmitted={reload} />}
            {modal === 'gift' && <GiftTokensModal onClose={() => setModal(null)} onSent={reload} />}
        </div>
    )
}