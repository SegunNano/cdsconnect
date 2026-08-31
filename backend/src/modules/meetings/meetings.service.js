import { createNotificationForAll } from '../notifications/notifications.service.js'
import { DEFAULT_RADIUS_METERS, NOTIFICATION_TYPES } from '../../constants.js'
import pool from '../../config/db.js'

const formatMeeting = (meeting) => ({
    ...meeting,
    meeting_date: meeting.meeting_date instanceof Date
        ? `${meeting.meeting_date.getUTCFullYear()}-${String(meeting.meeting_date.getUTCMonth() + 1).padStart(2, '0')}-${String(meeting.meeting_date.getUTCDate()).padStart(2, '0')}`
        : String(meeting.meeting_date).split('T')[0]
})

export const createMeeting = async (data) => {
    const {
        title,
        meeting_date,
        sign_in_open,
        late_threshold,
        sign_in_close,
        venue_lat,
        venue_lng,
        radius_meters,
        meeting_cost,
        lateness_cost
    } = data

    const dateOnly = meeting_date.split('T')[0]

    // Ensure incoming time strings include the WAT (+01:00) timezone offset
    const formatWAT = (val) => {
        if (!val) return val
        const s = String(val).trim().replace(' ', 'T')
        return s.includes('+') || s.includes('Z') || s.includes('-') ? s : `${s}+01:00`
    }

    // Force timezone in SQL
    const result = await pool.query(
        `INSERT INTO meetings (
            title, meeting_date, sign_in_open,
            late_threshold, sign_in_close,
            venue_lat, venue_lng, radius_meters,
            meeting_cost, lateness_cost
        ) VALUES (
            $1, ($2::TIMESTAMP AT TIME ZONE 'UTC')::DATE, 
            $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING *`,
        [
            title, dateOnly + 'T12:00:00Z', 
            formatWAT(sign_in_open),
            formatWAT(late_threshold), 
            formatWAT(sign_in_close),
            venue_lat, venue_lng, radius_meters || DEFAULT_RADIUS_METERS,
            meeting_cost || 1, lateness_cost || 1
        ]
    )

    const meeting = result.rows[0]
    // Notify all members
    await createNotificationForAll(
        'New Meeting Scheduled',
        `${meeting.title} has been scheduled for ${meeting.meeting_date}. Sign-in opens at ${new Date(meeting.sign_in_open).toLocaleTimeString()}.`,
        NOTIFICATION_TYPES.MEETING_CREATED
    )

    return formatMeeting(meeting)
}

export const getActiveMeeting = async () => {
    // Get meeting for today or upcoming
    const result = await pool.query(
        `SELECT * FROM meetings 
        WHERE meeting_date >= CURRENT_DATE
        ORDER BY meeting_date ASC
        LIMIT 1`
    )

    return result.rows[0] ? formatMeeting(result.rows[0]) : null
}

export const getAllMeetings = async () => {
    const result = await pool.query(
        `SELECT * FROM meetings 
        ORDER BY meeting_date DESC`
    )
    return result.rows.map(formatMeeting)
}

export const getMeetingById = async (meetingId) => {
    const result = await pool.query(
        'SELECT * FROM meetings WHERE id = $1',
        [meetingId]
    )
    if (result.rows.length === 0) {
        throw { status: 404, message: 'Meeting not found' }
    }
    return formatMeeting(result.rows[0])
}

export const getMeetingState = (meeting) => {
    const now = new Date()
    const signInOpen = new Date(meeting.sign_in_open)
    const lateThreshold = new Date(meeting.late_threshold)
    const signInClose = new Date(meeting.sign_in_close)

    // Compare local dates in WAT (Africa/Lagos) rather than UTC ISO strings
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
    const meetingStr = typeof meeting.meeting_date === 'string'
        ? meeting.meeting_date.split('T')[0]
        : new Date(meeting.meeting_date).toISOString().split('T')[0]

    const isToday = todayStr === meetingStr
    const isFuture = meetingStr > todayStr

    if (isFuture) return 'upcoming'
    if (isToday && now < signInOpen) return 'today_not_open'
    if (isToday && now >= signInOpen && now < lateThreshold) return 'open_on_time'
    if (isToday && now >= lateThreshold && now < signInClose) return 'open_late'
    if (isToday && now >= signInClose) return 'sign_in_closed'

    return null
}