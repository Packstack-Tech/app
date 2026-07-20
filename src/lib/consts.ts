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

// RevenueCat offering whose paywall is presented for upgrades. Pinned
// explicitly rather than relying on the dashboard's "current" pointer.
export const OFFERING_ID = 'web_full_access'

// Number of active (non-removed) trips a non-subscribed user may have.
export const FREE_TRIP_LIMIT = 3
