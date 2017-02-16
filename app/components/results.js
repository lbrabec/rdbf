var React = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var Icon = require("../components/icon").Icon;
var ResultInfo = require("../components/resultinfo").ResultInfo;
var ResultDetail = require("../components/resultdetail").ResultDetail;
var ResultsEmpty = require("../components/resultempty").ResultsEmpty;

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
      listResultsCombined = [<ResultsEmpty key="empty" span="6"/>];
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