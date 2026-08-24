import L from 'leaflet'

export const venuePin = L.divIcon({
    html: `
        <div style="position: relative; width: 36px; height: 44px;">
            <!-- Shadow -->
            <div style="
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 12px;
                height: 4px;
                background: rgba(0,0,0,0.2);
                border-radius: 50%;
            "></div>
            <!-- Pin body -->
            <div style="
                width: 36px;
                height: 36px;
                background: #008751;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 12px rgba(0,135,81,0.4);
                border: 3px solid #ffffff;
            ">
                <!-- Inner dot -->
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(45deg);
                    width: 10px;
                    height: 10px;
                    background: #ffffff;
                    border-radius: 50%;
                "></div>
            </div>
        </div>
    `,
    className: '',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44]
})

export const userPin = L.divIcon({
    html: `
        <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
            
            <style>
                @keyframes userRipple1 {
                    0% { transform: scale(0.5); opacity: 0.6; }
                    100% { transform: scale(2); opacity: 0; }
                }
                @keyframes userRipple2 {
                    0% { transform: scale(0.5); opacity: 0.4; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                @keyframes userPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            </style>

            <!-- Ripple 1 -->
            <div style="
                position: absolute;
                width: 24px;
                height: 24px;
                background: #4f46e5;
                border-radius: 50%;
                animation: userRipple1 2s ease-out infinite;
            "></div>

            <!-- Ripple 2 -->
            <div style="
                position: absolute;
                width: 24px;
                height: 24px;
                background: #4f46e5;
                border-radius: 50%;
                animation: userRipple2 2s ease-out infinite;
                animation-delay: 0.5s;
            "></div>

            <!-- White border ring -->
            <div style="
                position: absolute;
                width: 22px;
                height: 22px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            "></div>

            <!-- Inner filled circle -->
            <div style="
                position: absolute;
                width: 16px;
                height: 16px;
                background: #4f46e5;
                border-radius: 50%;
                animation: userPulse 2s ease-in-out infinite;
                box-shadow: 0 2px 8px rgba(79,70,229,0.5);
            "></div>
        </div>
    `,
    className: '',
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -30]
})

// Calculates distance between two lat/lng coordinates in meters
 export function getDistanceInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}