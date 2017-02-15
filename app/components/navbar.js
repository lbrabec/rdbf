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
                            <span id="live-info"><i className="fa fa-circle fa-fw fa-blink red"></i>&nbsp;Live</span>
                            <i className="fa fa-refresh fa-spin fa-fw" id="spinner"></i>
                            <span className="hidden" id="timer-id"></span>
                        </span>
                    </a>
                    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                </div>

                <div id="navbar" className="navbar-collapse collapse navbar-dark">
                    <ul className="nav navbar-nav navbar-right">
                    <li><a href="/results">results</a></li>
                    <li><a href="/testcases">testcases</a></li>
                    <li><a href="/groups">groups</a></li>
                    </ul>
                </div>
            </div>
        </nav>
      )
  }
});