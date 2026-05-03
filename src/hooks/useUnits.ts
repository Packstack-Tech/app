import { useMemo } from 'react'

import { useUser } from '@/hooks/useUser'
import {
  kmToMi,
  mToFt,
  cToF,
  kgToLb,
  cmToIn,
  miToKm,
  ftToM,
  fToC,
  lbToKg,
  inToCm,
} from '@/lib/unitConversions'

export function useUnits() {
  const user = useUser()

  return useMemo(() => {
    const isMetricWeight = user.unit_weight === 'METRIC'
    const isMetricDist = user.unit_distance === 'KM'
    const isCelsius = user.unit_temperature === 'C'

    return {
      isMetricWeight,
      isMetricDist,
      isCelsius,

      distanceLabel: isMetricDist ? 'km' : 'mi',
      elevationLabel: isMetricDist ? 'm' : 'ft',
      temperatureLabel: isCelsius ? '°C' : '°F',
      paceUnit: isMetricDist ? 'km/h' : 'mph',
      weightLabel: isMetricWeight ? 'kg' : 'lb',
      heightLabel: isMetricWeight ? 'cm' : 'in',

      formatDistance: (km: number) => isMetricDist ? km : kmToMi(km),
      formatElevation: (m: number) => isMetricDist ? m : mToFt(m),
      formatTemperature: (c: number) => isCelsius ? c : cToF(c),
      formatWeight: (kg: number) => isMetricWeight ? kg : kgToLb(kg),
      formatHeight: (cm: number) => isMetricWeight ? cm : cmToIn(cm),

      toCanonicalDistance: (v: number) => isMetricDist ? v : miToKm(v),
      toCanonicalElevation: (v: number) => isMetricDist ? v : ftToM(v),
      toCanonicalTemperature: (v: number) => isCelsius ? v : fToC(v),
      toCanonicalWeight: (v: number) => isMetricWeight ? v : lbToKg(v),
      toCanonicalHeight: (v: number) => isMetricWeight ? v : inToCm(v),

      paceOptions: [
        { value: 'easy', label: `Easy (~${isMetricDist ? '3.2 km/h' : '2 mph'})` },
        { value: 'moderate', label: `Moderate (~${isMetricDist ? '4.8 km/h' : '3 mph'})` },
        { value: 'fast', label: `Fast (~${isMetricDist ? '6.4 km/h' : '4 mph'})` },
      ],
    }
  }, [user.unit_weight, user.unit_distance, user.unit_temperature])
}
