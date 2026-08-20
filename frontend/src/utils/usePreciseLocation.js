export const getStableLocation = (targetAccuracy = 20, maxWaitMs = 10000) => {
  return new Promise((resolve, reject) => {
    const readings = []
    let watchId = null

    // Hard safety timer to prevent hung promises
    const timer = setTimeout(() => {
      cleanup()
      if (readings.length > 0) {
        // Return the best reading collected before timing out
        const best = readings.reduce((prev, curr) =>
          curr.accuracy < prev.accuracy ? curr : prev
        )
        resolve(best)
      } else {
        reject(new Error(`Could not obtain a precise GPS fix within ${maxWaitMs / 1000}s.`))
      }
    }, maxWaitMs)

    const cleanup = () => {
      clearTimeout(timer)
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords

        const currentReading = { lat, lng, accuracy }
        readings.push(currentReading)

        // Resolve immediately if high accuracy threshold is reached early
        if (accuracy <= targetAccuracy) {
          cleanup()
          resolve(currentReading)
          return
        }

        // Once 3 readings are collected, pick and resolve the most accurate
        if (readings.length >= 3) {
          cleanup()
          const best = readings.reduce((prev, curr) =>
            curr.accuracy < prev.accuracy ? curr : prev
          )
          resolve(best)
        }
      },
      (err) => {
        cleanup()
        reject(err)
      },
      {
        enableHighAccuracy: true,
        timeout: maxWaitMs,
        maximumAge: 0
      }
    )
  })
}

