import ReactGA from 'react-ga4'

// initialize google analytics
ReactGA.initialize('G-EJ2MHNXYKC')

// custom pageview with the location from react router
export const pageView = path => {
  return ReactGA.send({hitType: 'pageview', page: path})
}

// custom event with label being an optional parameter
export const customEvent = (category, action, label = '') => {
  return ReactGA.event({
    category: category,
    action: action,
    label: label,
  })
}
