export const GEO_OPTIONS = {
  enableHighAccuracy: true, // Forces physical GPS hardware where available
  timeout: 10000,           // Max wait time (ms) for a fix
  maximumAge: 0             // Stops browser caching; forces fresh readings
};

/**
 * Promise-based precise location getter.
 * Listens for GPS updates up to maxWaitMs, resolving early if accuracy <= targetAccuracy.
 */
export function getPreciseLocation(targetAccuracy = 15, maxWaitMs = 10000) {
  return new Promise((resolve, reject) => {
    let bestFix = null;
    let watchId = null;

    const timer = setTimeout(() => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      
      // Reject if even our best fix is too inaccurate
      if (bestFix && bestFix.coords.accuracy <= 25) {
        resolve(bestFix);
      } else {
        const currentAcc = bestFix ? Math.round(bestFix.coords.accuracy) : 'unknown';
        reject(new Error(`Weak GPS signal (±${currentAcc}m accuracy). Please step outside or near a window.`));
      }
    }, maxWaitMs);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!bestFix || pos.coords.accuracy < bestFix.coords.accuracy) {
          bestFix = pos;
        }

        // Lock onto exact location early if target met
        if (pos.coords.accuracy <= targetAccuracy) {
          clearTimeout(timer);
          navigator.geolocation.clearWatch(watchId);
          resolve(pos);
        }
      },
      (err) => {
        clearTimeout(timer);
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: maxWaitMs,
        maximumAge: 0
      }
    );
  });
}