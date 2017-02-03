var React = require('react');
var ReactDOM = require('react-dom');
var fetchJsonp = require('fetch-jsonp');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

var ResultsApp = React.createClass({
  getInitialState: function() {
    //hm?
    this.loadMore = this.loadMore.bind(this);

    this.refresh();
    return {results: []};
  },

  goLive: function(){
      this.timerID = setInterval(() => this.refresh(), 10000);
      $("#timer-id").text(this.timerID);
      $("#live-info").show();
  },

  endLive: function(){
      $("#live-info").hide();
      var timerID = $("#timer-id").text();
      if(timerID != ""){
          $("#timer-id").text("");
          clearInterval(timerID);
      }
  },

  componentDidMount: function(){
    this.refresh();
    this.goLive();

    //wrong place?
    //FIXME? this.timerID, closures and stuff?? hm
    $(window).scroll(function() {
       if($(window).scrollTop() != 0) {
           this.endLive();
       } else {
           this.goLive();
       }
    }.bind(this));
  },
  componentWillUnmount: function(){
    this.endLive();
  },

  handeData: function(data){
    if(this.state.results.length > 0) {
      var newestID = this.state.results[0].id;
      console.log(newestID);
      console.log(data.filter(function(result){ return result.id > newestID}));
      return data.filter(function(result){ return result.id > newestID});
    } else {
      return data;
    }
  },

refresh: function(accumulator = [], url = 'http://taskotron.fedoraproject.org/resultsdb_api/api/v2.0/results'){
//  refresh: function(accumulator = [], url = 'http://10.34.28.154:5001/api/v2.0/results?testcases=depcheck'){
    $("#spinner").show();
    fetchJsonp(url)
    .then(function(response) {
      return response.json()
    }).then(function(json) {
      console.log("refreshing the state");
      var newData = this.handeData(json.data);
      if(this.state.results.length == 0){
          console.log("results were empty, setting the state");
          this.setState({results: newData});
      } else {
        if(newData.length == 0){
          console.log("no new data");
          this.setState({results: accumulator.concat(this.state.results)});
        } else {
          console.log(json.next);

          //this.refresh(accumulator.concat(newData), json.next);
          this.setState({results: newData.concat(this.state.results)});
        }
      }
      $("#spinner").hide();
    }.bind(this))
    .catch(function(ex) {
      console.log('parsing failed', ex)
    });

  },

  loadMoreWrapper: function(){
    var oldestID = this.state.results[this.state.results.length - 1].id;
    this.loadMore(oldestID);
  },

  loadMore: function(oldestID, url = 'http://taskotron.fedoraproject.org/resultsdb_api/api/v2.0/results') {
      $("#spinner").show();
      fetchJsonp(url)
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        var newData = json.data.filter(function(result){return result.id < oldestID});
        if(newData.length != 0){
            //render
            this.setState({results: this.state.results.concat(newData)});
            $("#spinner").hide();
        } else {
            //throw away, go next
            var next = json.next.replace(/[\?&]callback=[^\?]*/gi,""); //ugh
            console.log(next);
            this.loadMore(oldestID, next);
        }
      }.bind(this))
      .catch(function(ex) {
        console.log('parsing failed', ex)
      });

  },

  render: function() {
    return (
      <div className="text-center">
        <Results results={this.state.results} />
        <br />
        <button type="button" className="btn btn-default more" onClick={this.loadMoreWrapper}>
          <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
        </button>
      </div>
    )
  }
});

var Results = React.createClass({
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
          <td className="detail-data text-right">{this.props.result.submit_time.split(".")[0].replace("T", " ")}</td>
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



ReactDOM.render(<ResultsApp />, document.getElementById('app'));
