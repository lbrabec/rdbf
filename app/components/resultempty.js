var React = require('react');
var Icon = require('../components/icon').Icon;

export var ResultsEmpty = React.createClass({
  render: function(){
    return (
      <tr>
        <td colSpan={this.props.span}><Icon type="frown-o" />&nbsp;no results found</td>
      </tr>
    )
  }
});