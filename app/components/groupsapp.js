var React = require('react');
var fetchJsonp = require('fetch-jsonp');
var queryString = require('query-string');
var Navbar = require("../components/navbar").Navbar;
var Search = require("../components/search").Search;
var Results = require("../components/results").Results;
var Config = require("../config/config").Config; 


export var GroupsApp = React.createClass({
  render: function() {
    return (
      <div>
        <Navbar />
        <div className="text-center container">
          groups TBD
        </div>
      </div>
    )
  }
});