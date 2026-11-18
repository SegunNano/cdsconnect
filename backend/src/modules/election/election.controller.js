import * as electionService from './election.service.js'

// ── MEMBER CONTROLLERS ───────────────────────────────────────────
export const handleGetElectionStatus = async (req, res, next) => {
    try {
        const status = await electionService.getElectionStatus()
        res.json(status)
    } catch (err) {
        next(err)
    }
}

export const handleGetElectionState = async (req, res, next) => {
    try {
        const state = await electionService.getElectionState(req.member.id)
        res.json(state)
    } catch (err) {
        next(err)
    }
}

export const handleApplyToPosition = async (req, res, next) => {
    try {
        const result = await electionService.applyToPosition(req.member.id, {
            role: req.body.role,
            manifesto: req.body.manifesto,
            file: req.file
        })
        res.status(201).json(result)
    } catch (err) {
        next(err)
    }
}

export const handleUpdateApplication = async (req, res, next) => {
    try {
        const result = await electionService.updateApplication(req.member.id, {
            manifesto: req.body.manifesto,
            file: req.file
        })
        res.json(result)
    } catch (err) {
        next(err)
    }
}

export const handleWithdrawApplication = async (req, res, next) => {
    try {
        const result = await electionService.withdrawApplication(req.member.id)
        res.json(result)
    } catch (err) {
        next(err)
    }
}

export const handleCastVote = async (req, res, next) => {
    try {
        console.log(req.body)
        const result = await electionService.castVote(req.member.id, {
            role: req.body.role,
            candidateId: req.body.candidateId
        })
        res.json(result)
    } catch (err) {
        next(err)
    }
}

// ── DEV CONTROLLERS ──────────────────────────────────────────────
export const handleGetAdminState = async (req, res, next) => {
    try {
        const state = await electionService.getAdminState()
        res.json(state)
    } catch (err) {
        next(err)
    }
}

export const handleCreateElection = async (req, res, next) => {
    try {
        const election = await electionService.createElection(req.member.id, {
            title: req.body.title,
            roles: req.body.roles,
            minMonthsLeft: req.body.min_months_left
        })
        res.status(201).json(election)
    } catch (err) {
        next(err)
    }
}

export const handleTransitionElection = async (req, res, next) => {
    try {
        const state = await electionService.transitionElection(req.member.id, {
            action: req.body.action,
            pin: req.body.pin
        })
        res.json(state)
    } catch (err) {
        next(err)
    }
}

export const handleRemoveCandidate = async (req, res, next) => {
    try {
        const state = await electionService.removeCandidate(req.params.id, req.body.reason)
        res.json(state)
    } catch (err) {
        next(err)
    }
}