var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router').Router
var Route = require('react-router').Route
var Redirect = require('react-router').Redirect

var browserHistory = require('react-router').browserHistory

var ResultsApp = require("./components/resultsapp").ResultsApp;

require('react-datepicker/dist/react-datepicker.css');
require('./static/style.css');


ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/results" component={ResultsApp} />
    <Redirect from="/" to="/results" />
  </Router>
  , document.getElementById('app'));
