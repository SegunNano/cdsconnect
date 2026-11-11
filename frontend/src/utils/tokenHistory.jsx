import { TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'

export const sumTokens = (history, type) =>
    history.filter(h => h.type === type)
        .reduce((sum, h) => sum + parseInt(h.tokens || 0, 10), 0)

const naira = (v) => `₦${parseInt(v || 0, 10).toLocaleString()}`

export const getItemConfig = (item) => {
    switch (item.type) {
        case 'topup': {
            const byRequest = Boolean(item.receipt_no)
            return {
                icon: <TrendingUp size={18} color="#008751" />, iconBg: '#e6f4ee',
                title: byRequest
                    ? `Top-up · ${item.receipt_no}`
                    : `Top-up by ${item.performed_by_first || ''} ${item.performed_by_last || ''}`.trim(),
                subtitle: byRequest
                    ? `${naira(item.naira_value)} · approved by ${item.performed_by_first || 'treasurer'}`
                    : `${naira(item.naira_value)} paid`,
                amount: `+${item.tokens}`, color: '#008751'
            }
        }
        case 'transfer_sent':
            return {
                icon: <ArrowRightLeft size={18} color="#e53e3e" />, iconBg: '#fff0f0',
                title: `Sent to ${item.recipient_name || ''} ${item.recipient_last || ''}`.trim(),
                subtitle: item.recipient_state_code,
                amount: `-${item.tokens}`, color: '#e53e3e'
            }
        case 'transfer_received':
            return {
                icon: <ArrowRightLeft size={18} color="#4f46e5" />, iconBg: '#eef2ff',
                title: `Received from ${item.sender_name || ''} ${item.sender_last || ''}`.trim(),
                subtitle: item.sender_state_code,
                amount: `+${item.tokens}`, color: '#4f46e5'
            }
        default:
            return {
                icon: <TrendingDown size={18} color="#e53e3e" />, iconBg: '#fff0f0',
                title: item.meeting_title || 'Deduction',
                subtitle: item.deduction_type === 'excuse' ? 'Excused absence'
                    : item.deduction_type === 'manual' ? 'Manual marking'
                    : item.is_late ? 'Late attendance' : 'Attendance',
                amount: `-${item.tokens}`, color: '#e53e3e'
            }
    }
}