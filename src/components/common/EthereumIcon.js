
import React, { Component } from 'react'
import PropTypes from 'prop-types'

/**
 * Large Ethereum icon.
 * Original svg courtesy: https://github.com/coopermaruyama/react-web3/
 *
 * @extends {Component}
 */
export default class EthereumIcon extends Component {

  render () {

    return (
      <svg width="100%" height="100%" position="relative" viewBox="0 0 332 417" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <defs>
          <path d="M198.610685,43.1017808 C107.24977,43.1017808 33.1017808,117.24977 33.1017808,208.610685 C33.1017808,299.971599 107.24977,374.119588 198.610685,374.119588 C289.971599,374.119588 364.119588,299.971599 364.119588,208.610685 C364.119588,117.24977 289.971599,43.1017808 198.610685,43.1017808 L198.610685,43.1017808 Z M198.610685,341.017808 C125.455749,341.017808 66.2035615,281.76562 66.2035615,208.610685 C66.2035615,177.991537 76.6306225,149.855024 94.1745663,127.511322 L279.710047,313.046803 C257.366345,330.590747 229.229832,341.017808 198.610685,341.017808 L198.610685,341.017808 Z M303.046803,289.710047 L117.511322,104.174566 C139.855024,86.6306225 167.991537,76.2035615 198.610685,76.2035615 C271.76562,76.2035615 331.017808,135.455749 331.017808,208.610685 C331.017808,239.229832 320.590747,267.366345 303.046803,289.710047 L303.046803,289.710047 Z" id="path-1"></path>
        </defs>
        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g id="Group" transform="translate(-33.000000, 0.000000)">
            <g id="Ethereum_logo_2014" opacity="0.208899457" transform="translate(71.000000, 0.000000)" fillRule="nonzero">
              <polygon id="Shape" fill="#343434" points="127.9611 0 125.1661 9.5 125.1661 285.168 127.9611 287.958 255.9231 212.32"></polygon>
              <polygon id="Shape" fill="#8C8C8C" points="127.962 0 0 212.32 127.962 287.959 127.962 154.158"></polygon>
              <polygon id="Shape" fill="#3C3C3B" points="127.9611 312.1866 126.3861 314.1066 126.3861 412.3056 127.9611 416.9066 255.9991 236.5866"></polygon>
              <polygon id="Shape" fill="#8C8C8C" points="127.962 416.9052 127.962 312.1852 0 236.5852"></polygon>
              <polygon id="Shape" fill="#141414" points="127.9611 287.9577 255.9211 212.3207 127.9611 154.1587"></polygon>
              <polygon id="Shape" fill="#393939" points="0.0009 212.3208 127.9609 287.9578 127.9609 154.1588"></polygon>
            </g>
          </g>
        </g>
      </svg>
    )
  }
}

EthereumIcon.propTypes = {
  message: PropTypes.string,
}
