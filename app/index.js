var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router').Router
var Route = require('react-router').Route
var Redirect = require('react-router').Redirect

var browserHistory = require('react-router').browserHistory

var ResultsApp = require("./components/resultsapp").ResultsApp;
var GroupsApp = require("./components/groupsapp").GroupsApp;
var TestcasesApp = require("./components/testcasesapp").TestcasesApp;

require('react-datepicker/dist/react-datepicker.css');
require('./static/style.css');


ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/results" component={ResultsApp} />
    <Route path="/groups" component={GroupsApp} />
    <Route path="/testcases" component={TestcasesApp} />
    <Redirect from="/" to="/results" />
  </Router>
  , document.getElementById('app'));
