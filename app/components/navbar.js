var React = require('react');

export var Navbar = React.createClass({
  render: function(){
      return (
        <nav className="navbar navbar-default navbar-fixed-top navbar-dark">
            <div className="container">
                <div className="navbar-header">
                    <a className="navbar-brand" href="#">
                        <span className="logo">
                            <img src="static/images/taskotron-box.svg" />
                        </span>
                        <span className="logo-text">ResultsDB Frontend &nbsp;&nbsp;
                            <span id="live-info"><i className="fa fa-circle fa-fw red"></i>&nbsp;Live</span>
                            <i className="fa fa-refresh fa-spin fa-fw" id="spinner"></i>
                            <span className="hidden" id="timer-id"></span>
                        </span>
                    </a>
                </div>
            </div>
        </nav>
      )
  }
});