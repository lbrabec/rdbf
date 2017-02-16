var React = require('react');
var Icon = require('../components/icon').Icon;

export var ResultDetail = React.createClass({
  render: function(){
    var data = this.props.result.data;
    data = Object.keys(this.props.result.data).map(function(key){
      return (
        <div className="row" key={"detail"+this.props.result.id+key}>
          <div className="col-md-3"><strong>{key}: </strong></div>
          <div className="col-md-9">{this.props.result.data[key]}</div>
        </div>
      )
    }.bind(this));
    var groups = this.props.result.groups.map(function(g){
      return (<div key={g}>{g}</div>)
    });
    var href = this.props.result.href;
    var ref_url = this.props.result.ref_url;
    return (
        <tr>
          <td colSpan="6">
            <div className="collapse text-left" id={"collapse"+this.props.result.id}>
              <div className="detailed">
                <div className="row">
                  <div className="col-md-3"><strong>groups: </strong></div>
                  <div className="col-md-9">{groups}</div>
                </div>
                {data}
                <br />
                <a target="_blank" href={href}><Icon type="file-code-o" />&nbsp;JSON</a><br />
                <a target="_blank" href={ref_url}><Icon type="file-text-o" />&nbsp;Logs</a><br />
              </div>
            </div>
          </td>
        </tr>
      )
  }
});