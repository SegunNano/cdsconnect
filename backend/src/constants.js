export const RATE = 500 // 1 token = ₦500

export const DEFAULT_VENUE_LAT = 6.4916551571223735
export const DEFAULT_VENUE_LNG = 3.349012905489806
// export const DEFAULT_RADIUS_METERS = 1000
export const DEFAULT_RADIUS_METERS = 100

export const BREAKOUT_SESSIONS = [
    "Web Development",
    "Project Management",
    "Graphic Design",
    "Cybersecurity",
    "Data Analysis",
    "UI/UX Design"
]

export const ROLES = [
    "member",
    "president",
    "vice_president",
    "general_secretary",
    "treasurer",
    "assistant_treasurer",
    "financial_secretary",
    "pro1",
    "pro2",
    "coordinator"
]

export const NOTIFICATION_TYPES = {
    EXCUSE_SUBMITTED: 'excuse_submitted',
    EXCUSE_APPROVED: 'excuse_approved',
    EXCUSE_REJECTED: 'excuse_rejected',
    TOPUP: 'topup',
    MEETING_CREATED: 'meeting_created',
    LOW_TOKEN: 'low_token',
    CLEARANCE_READY: 'clearance_ready',
    EXPENSE_LOGGED: 'expense_logged',
    REINSTATEMENT: 'reinstatement'
}

export const EXCUSE_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    APPROVED_NOT_NEEDED: 'approved_not_needed',
    REJECTED: 'rejected'
}