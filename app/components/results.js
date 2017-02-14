var React = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

export var Results = React.createClass({
  render: function(){
    var listResults = this.props.results.map(function(result){
      return (
        <ResultInfo result={result} key={result.id}/>
      )
    });

    var listResultsDetails = this.props.results.map(function(result){
      return (
        <ResultDetail result={result} key={"detail"+result.id} />
      )
    });

    var empty = (<tr></tr>);

    var listResultsCombined = []
    listResults.forEach(function(e, i){listResultsCombined.push(e, listResultsDetails[i], empty)});
    if(listResultsCombined.length == 0){
      listResultsCombined = [<ResultsEmpty key="empty"/>];
    }

    return (
      <div>
        <table className="table-striped">
        <thead>
        <tr>
            <th className="detail-data text-center"><i className="fa fa-info-circle fa-fw" aria-hidden="true"></i></th>
            <th className="detail-data">testcase</th>
            <th className="detail-data">item</th>
            <th className="detail-data">note</th>
            <th className="detail-data text-right">submitted</th>
            <th className="text-center">detail</th>
        </tr>
        </thead>
        <ReactCSSTransitionGroup
            component="tbody"
            transitionName="example"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}>
              {listResultsCombined}
        </ReactCSSTransitionGroup>
        </table>
      </div>
    )
  }
});

var ResultsEmpty = React.createClass({
  render: function(){
    return (
      <tr>
        <td colSpan="6">no results found</td>
      </tr>
    )
  }
});

var ResultInfo = React.createClass({
  render: function(){
    var icon = function(outcome){
      if (outcome == "PASSED") {
        return (<i className="fa fa-check-circle fa-fw" aria-hidden="true"></i>)
      } else
      if (outcome == "FAILED"){
        return (<i className="fa fa-times-circle fa-fw" aria-hidden="true"></i>)
      } else
      if (outcome == "NEEDS_INSPECTION"){
        return (<i className="fa fa-question-circle fa-fw" aria-hidden="true"></i>)
      } else { //INFO
        return (<i className="fa fa-info-circle fa-fw" aria-hidden="true"></i>)
      }
    }(this.props.result.outcome);
    return (
      <tr key={this.props.result.id} className="result-detail">
          <td className={"outcome text-center "+this.props.result.outcome}>{icon}</td>
          <td className="detail-data text-left">{this.props.result.testcase.name}</td>
          <td className="detail-data text-left">{this.props.result.data.item[0]}</td>
          <td className="detail-data text-left">{this.props.result.note}</td>
          <td className="detail-data text-right">{this.props.result.submit_time.split(".")[0].replace("T", "\n")}</td>
          <td className="detail-data text-center"><a className="" role="button" data-toggle="collapse" href={"#collapse"+this.props.result.id} aria-expanded="false" aria-controls="collapseExample">
              <i className="detail-toggle fa fa-chevron-circle-down fa-fw" aria-hidden="true"></i>
          </a></td>
      </tr>

    )
  }
});

var ResultDetail = React.createClass({
  render: function(){
    return (
        <tr>
          <td colSpan="6">
            <div className="collapse" id={"collapse"+this.props.result.id}>
              <pre className="text-left">
                {JSON.stringify(this.props.result, null, ' ')}
              </pre>
            </div>
          </td>
        </tr>
      )
  }
});