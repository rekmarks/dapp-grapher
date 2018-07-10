import React, { Component } from 'react';
import Grapher from './Grapher'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Dapp Grapher</h1>
        </header>
        <Grapher />
      </div>
    );
  }
}

export default App
