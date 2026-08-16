import pool from '../../config/db.js'

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

   


    const result = await pool.query(
        `INSERT INTO meetings (
            title, meeting_date, sign_in_open,
            late_threshold, sign_in_close,
            venue_lat, venue_lng, radius_meters,
            meeting_cost, lateness_cost
        ) VALUES (
            $1, $2::DATE, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING *`,
        [
            title, meeting_date, sign_in_open,
            late_threshold, sign_in_close,
            venue_lat, venue_lng, radius_meters || 100,
            meeting_cost || 1, lateness_cost || 1
        ]
    )

    return result.rows[0]
}

export const getActiveMeeting = async () => {
    // Get meeting for today or upcoming
    const result = await pool.query(
        `SELECT * FROM meetings 
        WHERE meeting_date >= CURRENT_DATE
        ORDER BY meeting_date ASC
        LIMIT 1`
    )

    return result.rows[0] || null
}

export const getAllMeetings = async () => {
    const result = await pool.query(
        `SELECT * FROM meetings 
        ORDER BY meeting_date DESC`
    )
    return result.rows
}

export const getMeetingById = async (meetingId) => {
    const result = await pool.query(
        'SELECT * FROM meetings WHERE id = $1',
        [meetingId]
    )
    if (result.rows.length === 0) {
        throw { status: 404, message: 'Meeting not found' }
    }
    return result.rows[0]
}

export const getMeetingState = (meeting) => {
    const now = new Date()
    const signInOpen = new Date(meeting.sign_in_open)
    const lateThreshold = new Date(meeting.late_threshold)
    const signInClose = new Date(meeting.sign_in_close)
    const meetingDate = new Date(meeting.meeting_date)

    // Is it today?
    const isToday = now.toDateString() === meetingDate.toDateString()

    if (!isToday && now < meetingDate) {
        return 'upcoming'
    }

    if (isToday && now < signInOpen) {
        return 'today_not_open'
    }

    if (isToday && now >= signInOpen && now < lateThreshold) {
        return 'open_on_time'
    }

    if (isToday && now >= lateThreshold && now < signInClose) {
        return 'open_late'
    }

    if (isToday && now >= signInClose) {
        return 'sign_in_closed'
    }

    return null
}