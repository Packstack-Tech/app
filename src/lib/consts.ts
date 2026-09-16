export type SYSTEM_UNIT = 'METRIC' | 'IMPERIAL'

export enum DISTANCE {
  Miles = 'MI',
  Kilometers = 'KM',
}

export enum DISTANCE_LABEL {
  MI = 'Miles',
  KM = 'km',
}

export enum TEMP {
  Fahrenheit = 'F',
  Celsius = 'C',
}

export enum TRIP_STATUS {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export const DATE_SHORT = 'MMM D'
export const DATE_FULL = DATE_SHORT + ', YYYY'

export const distances = [
  {
    label: 'Miles',
    value: DISTANCE.Miles,
  },
  {
    label: 'Kilometers',
    value: DISTANCE.Kilometers,
  },
]

export const temps = [
  {
    label: 'F',
    value: TEMP.Fahrenheit,
  },
  {
    label: 'C',
    value: TEMP.Celsius,
  },
]

export const weightUnits = [
  {
    label: 'Metric',
    value: 'METRIC',
  },
  {
    label: 'Imperial',
    value: 'IMPERIAL',
  },
]

export const DraggableTypes = {
  PHOTO: 'photo',
}

// RevenueCat entitlement that unlocks premium access. This is the shared
// entitlement identifier across every platform product (Apple/Google/Web),
// not a per-store product ID.
export const ENTITLEMENT_ID = 'Full Access'

// Fallback RevenueCat offering, used only if the dashboard's "current"
// pointer is unset. Which paywall is presented is dashboard-driven: change
// the default offering in RevenueCat and every platform follows without a
// deploy.
export const FALLBACK_OFFERING_ID = 'web_full_access'

// Number of active (non-removed) trips a non-subscribed user may have.
export const FREE_TRIP_LIMIT = 3
export const FREE_KIT_LIMIT = 1

// Number of packs a non-subscribed user may have within a single trip. Note
// this is separate from FREE_TRIP_LIMIT: that one caps the trips listed on the
// Packs tab, this one caps the pack variants inside one trip.
export const FREE_PACKS_PER_TRIP = 1
