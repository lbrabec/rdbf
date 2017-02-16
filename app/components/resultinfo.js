var React = require('react');
var Icon = require('../components/icon').Icon;

export var ResultInfo = React.createClass({
  render: function(){
    var icon = function(outcome){
      if (outcome == "PASSED") {
        return (<Icon type="check-circle" />)
      } else
      if (outcome == "FAILED"){
        return (<Icon type="times-circle" />)
      } else
      if (outcome == "NEEDS_INSPECTION"){
        return (<Icon type="question-circle" />)
      } else { //INFO
        return (<Icon type="info-circle" />)
      }
    }(this.props.result.outcome);
    return (
      <tr key={this.props.result.id} className="result-detail">
          <td className={"outcome text-center "+this.props.result.outcome}>{icon}</td>
          <td className="detail-data text-left">{this.props.result.testcase.name}</td>
          <td className="detail-data text-left">{this.props.result.data.item[0]}</td>
          <td className="detail-data text-left">{this.props.result.note}</td>
          <td className="detail-data text-right">{this.props.result.submit_time.split(".")[0].replace("T", "\n")}</td>
          <td className="detail-data text-center">
            <a className="" role="button" data-toggle="collapse" href={"#collapse"+this.props.result.id} aria-expanded="false" aria-controls="collapseExample">
              <i className="detail-toggle fa fa-chevron-circle-down fa-fw" aria-hidden="true"></i>
            </a>
          </td>
      </tr>

    )
  }
});