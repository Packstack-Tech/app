import mixpanel from "mixpanel-browser"
mixpanel.init("YOUR_MIXPANEL_TOKEN")

export const Mixpanel = {
  identify: (id: string) => {
    if (import.meta.env.PROD) mixpanel.identify(id)
  },
  alias: (id: string) => {
    if (import.meta.env.PROD) mixpanel.alias(id)
  },
  track: (name: string, props?: object) => {
    if (import.meta.env.PROD) mixpanel.track(name, props)
  },
  people: {
    set: (props: object) => {
      if (import.meta.env.PROD) mixpanel.people.set(props)
    },
  },
}
