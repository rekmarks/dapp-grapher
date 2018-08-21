
/**
 * https://github.com/mui-org/material-ui/tree/master/docs/src/pages/page-layout-examples/dashboard
 */

import React from 'react'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'

const spacingUnit = 8

// A theme with custom primary and secondary color.
const theme = createMuiTheme({
  palette: {
    primary: {
      dark: '#301b70',
      main: '#4527a0',
      light: '#6a52b3',
    },
    secondary: {
      dark: '#b28900',
      main: '#ffc400',
      light: '#ffcf33',
    },
  },
  typography: {
    fontFamily: '"Helvetica", "Arial", sans-serif',
    fontSize: 12,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  },
  overrides: {
    MuiListItemText: {
      root: {
        paddingLeft: 0,
      },
    },
    MuiDrawer: {
      docked: {
        width: 0,
      },
    },
  },
  spacing: {
    unit: spacingUnit,
  },
})

function withMuiRoot (Component) {
  function WithMuiRoot (props) {
    // MuiThemeProvider makes the theme available down the React tree
    // thanks to React context.
    return (
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...props} />
      </MuiThemeProvider>
    )
  }

  return WithMuiRoot
}

export default withMuiRoot

export {
  spacingUnit,
}
