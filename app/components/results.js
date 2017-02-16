var React = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var Icon = require("../components/icon").Icon;

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

    var empty = function(id){return (<tr key={"emptyrow"+id}></tr>)};

    var listResultsCombined = []
    listResults.forEach(function(e, i){
      listResultsCombined.push(e, listResultsDetails[i], empty(this.props.results[i].id))
    }.bind(this));
    if(listResultsCombined.length == 0){
      listResultsCombined = [<ResultsEmpty key="empty"/>];
    }

    return (
      <div>
        <table className="table-striped">
        <thead>
        <tr>
            <th className="detail-data text-center"><Icon type="info-circle" /></th>
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

var ResultDetail = React.createClass({
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