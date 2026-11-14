import PaymentAccountCard from './PaymentAccountCard'
import SystemControlsCard from './SystemControlsCard'

export default function SettingsTab({ regStatus, card, sectionHead, onToggle }) {
    const isRegOpen = regStatus?.registration_open

    return (
        <>
            <SystemControlsCard card={card} sectionHead={sectionHead} isRegOpen={isRegOpen} onToggle={onToggle} />
            <PaymentAccountCard card={card} sectionHead={sectionHead} />
        </>
    )
}