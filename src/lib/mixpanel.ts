import mixpanel from "mixpanel-browser"
mixpanel.init("e608ccade885e850a86efc9c098cd296", {
  track_pageview: true,
  persistence: "localStorage",
})

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
