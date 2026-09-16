// src/middlewares/sanitizers.js
import sanitizeHtml from 'sanitize-html';

const cleanValue = (val) => {
    if (typeof val === 'string') {
        return sanitizeHtml(val, {
            allowedTags: [],
            allowedAttributes: {}
        }).trim();
    }
    if (typeof val === 'object' && val !== null) {
        for (const key in val) {
            val[key] = cleanValue(val[key]);
        }
    }
    return val;
};

export const globalSanitizer = (req, res, next) => {
    // Sanitize req.query keys directly (don't reassign req.query itself)
    if (req.query) {
        for (const key in req.query) {
            req.query[key] = cleanValue(req.query[key]);
        }
    }

    // Sanitize req.body keys directly
    if (req.body) {
        for (const key in req.body) {
            req.body[key] = cleanValue(req.body[key]);
        }
    }

    // Sanitize req.params keys directly
    if (req.params) {
        for (const key in req.params) {
            req.params[key] = cleanValue(req.params[key]);
        }
    }

    next();
};
export const cleanInput = (value) => {
    if (typeof value !== 'string') return value;
    
    return sanitizeHtml(value, {
        allowedTags: [],       // Strip ALL HTML tags (e.g. <script>, <div>, <img>)
        allowedAttributes: {}  // Strip ALL attributes (e.g. onerror=, onload=)
    }).trim();
};