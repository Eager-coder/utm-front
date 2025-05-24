// DroneRouteMap.tsx
import React, { useState, useEffect, useRef } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  type Libraries,
} from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '900px',
}

// Astana center
const defaultCenter = { lat: 51.1605, lng: 71.4704 }

// Your “DB” route
const route: google.maps.LatLngLiteral[] = [
  { lat: 51.166, lng: 72.51 },
  { lat: 51.1605, lng: 71.4704 },
  { lat: 51.165, lng: 71.48 },
  { lat: 51.155, lng: 71.46 },
]

const libraries: Libraries = ['geometry']

export default function DroneRouteMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries,
  })

  // drone’s current position
  const [dronePos, setDronePos] = useState<google.maps.LatLngLiteral>(route[0])
  const segmentRef = useRef(0) // which leg of the route we’re on
  const startTimeRef = useRef<number>(0) // when current segment began

  useEffect(() => {
    if (!isLoaded) return
    const segmentDuration = 8_000 // ms per leg

    const animate = () => {
      const now = performance.now()
      if (!startTimeRef.current) startTimeRef.current = now
      const elapsed = now - startTimeRef.current
      const t = Math.min(elapsed / segmentDuration, 1)

      // endpoints of this leg
      const from = route[segmentRef.current]
      const to = route[(segmentRef.current + 1) % route.length]

      // interpolate along the great-circle path
      const interpolated = google.maps.geometry.spherical.interpolate(
        new google.maps.LatLng(from),
        new google.maps.LatLng(to),
        t,
      )

      setDronePos({
        lat: interpolated.lat(),
        lng: interpolated.lng(),
      })

      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        // move to next segment
        segmentRef.current = (segmentRef.current + 1) % route.length
        startTimeRef.current = 0
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
    return () => {
      startTimeRef.current = 0
    }
  }, [isLoaded])

  if (loadError) return <div>Map load error</div>
  if (!isLoaded) return <div>Loading…</div>

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={13}
    >
      {/* static route */}
      {route.map((p, i) => (
        <Marker key={i} position={p} />
      ))}
      <Polyline
        path={route}
        options={{ strokeColor: '#4285F4', strokeWeight: 3, geodesic: true }}
      />

      {/* moving “drone” */}
      <Marker position={dronePos} label={{ text: '🚁', fontSize: '24px' }} />
    </GoogleMap>
  )
}
