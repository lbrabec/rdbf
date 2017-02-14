var React = require('react');

export var Icon = React.createClass({
  render: function(){
    return (
      <i className={"fa fa-"+this.props.type+" fa-fw"} aria-hidden="true"></i>
    )
  }
});