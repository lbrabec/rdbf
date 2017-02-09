var React = require('react');
var ReactDOM = require('react-dom');
var fetchJsonp = require('fetch-jsonp');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var Moment = require('moment');

var ResultsApp = React.createClass({
  getInitialState: function() {
    //hm?
    //this.loadMore = this.loadMore.bind(this);

    //this.refresh();
    return {
      results: [],
      urlBase: 'http://taskotron.fedoraproject.org/resultsdb_api/api/v2.0/results',
      urlQuery: ""
    };
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

  handleSearch: function(url){
    this.setState({urlQuery: url, results: []}, function(){
      this.refresh([],"");
    }.bind(this));

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

  refresh: function(accumulator = [], url = ""){
    if(url==""){
      url = this.state.urlBase+this.state.urlQuery;
    }
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

  loadMore: function(oldestID, url = "") {
      if(url==""){
        url = this.state.urlBase+this.state.urlQuery;
      }

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
        <Search onSubmit={this.handleSearch}/>
        <br />
        <Results results={this.state.results} />
        <br />
        <button type="button" className="btn btn-default more" onClick={this.loadMoreWrapper}>
          <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
        </button>
      </div>
    )
  }
});

var Search = React.createClass({
  getInitialState: function() {
    return {
      items: "",
      testcases: "",
      outcomeP: false,
      outcomeF: false,
      outcomeN: false,
      outcomeI: false,
      since: '31'
    };
  },

  handleSearch: function(event){
    event.preventDefault();
    var outcomes = ['PASSED', 'FAILED', 'NEEDS_INSPECTION', 'INFO'].filter(function(outcome){
      const key = "outcome"+outcome[0];
      return this.state[key];
    }.bind(this));

    console.log(outcomes);
    var url = "?"
    if(this.state.items != ""){
      url = url+"&item:like="+this.state.items.replace("*","%25");
    }
    if(this.state.testcases != ""){
      url = url+"&testcases:like="+this.state.testcases.replace("*","%25");
    }
    if(outcomes.length > 0){
      url = url+"&outcome="+outcomes.reduce(function(a,b){return a+","+b});
    }
    if(this.state.since != '0'){
      url = url+"&since="+Moment().subtract(this.state.since, 'days').toISOString();
    }

    console.log(url);
    this.props.onSubmit(url);
  },

  handleCheckbox: function(event){
    const name = event.target.name;
    this.setState({
      [name]: event.target.checked
    });
  },

  handleRadio: function(event){
    this.setState({
      since: event.target.value
    });
  },

  handleText: function(event){
    const name = event.target.name;
    this.setState({
      [name]: event.target.value
    });
  },

  render: function(){
    return (
      <div id="search-form-wrapper" className="text-left">
        <div id="search-form-header" className="text-left">&nbsp;&nbsp;<i className="fa fa-search" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;search</div>
        <form className="search-form" onSubmit={this.handleSearch}>
          <input className="form-control" id="search-items" placeholder="items" name="items" value={this.state.items} onChange={this.handleText}/>
          <br />
          <input className="form-control" id="search-testcases" placeholder="testcases" name="testcases" value={this.state.testcases} onChange={this.handleText}/>
          <br />
          <div className="row">
            <div className="col-xs-6">
              Select outcomes:
              <div id="search-checkboxes">
                <input type="checkbox" value="PASSED" id="checkbox-passed" checked={this.state.outcomeP} name="outcomeP" onChange={this.handleCheckbox}/>
                <label className="checkbox-inline checkbox PASSED" htmlFor="checkbox-passed">
                  <i className="fa fa-check-circle fa-fw" aria-hidden="true"></i>&nbsp;PASSED
                </label>

                <input type="checkbox" value="FAILED" id="checkbox-failed" checked={this.state.outcomeF} name="outcomeF" onChange={this.handleCheckbox}/>
                <label className="checkbox-inline checkbox FAILED" htmlFor="checkbox-failed">
                  <i className="fa fa-times-circle fa-fw" aria-hidden="true"></i>&nbsp;FAILED
                </label>

                <input type="checkbox" value="NEEDS_INSPECTION" id="checkbox-needs-inspection" checked={this.state.outcomeN} name="outcomeN" onChange={this.handleCheckbox}/>
                <label className="checkbox-inline checkbox NEEDS_INSPECTION" htmlFor="checkbox-needs-inspection">
                  <i className="fa fa-question-circle fa-fw" aria-hidden="true"></i>&nbsp;NEEDS_INSPECTION
                </label>

                <input type="checkbox" value="INFO" id="checkbox-info" checked={this.state.outcomeI} name="outcomeI" onChange={this.handleCheckbox}/>
                <label className="checkbox-inline checkbox INFO" htmlFor="checkbox-info">
                  <i className="fa fa-info-circle fa-fw" aria-hidden="true"></i>&nbsp;INFO
                </label>
              </div>
            </div>

            <div className="col-xs-6">
              Since:
              <div id="search-checkboxes">
                <input type="radio" name="radioOne" id="radio-one" value="1" checked={this.state.since === '1'} onChange={this.handleRadio} />
                <label className="radio-inline radiobox" htmlFor="radio-one">24 hours</label>

                <input type="radio" name="radioThree" id="radio-three" value="3" checked={this.state.since === '3'} onChange={this.handleRadio} />
                <label className="radio-inline radiobox" htmlFor="radio-three">3 days</label>

                <input type="radio" name="radioWeek" id="radio-week" value="7" checked={this.state.since === '7'} onChange={this.handleRadio} />
                <label className="radio-inline radiobox" htmlFor="radio-week">a week</label>

                <input type="radio" name="radioMonth" id="radio-month" value="31" checked={this.state.since === '31'} onChange={this.handleRadio} />
                <label className="radio-inline radiobox" htmlFor="radio-month">a month</label>

                <input type="radio" name="radioUnlimited" id="radio-unlimited" value="0" checked={this.state.since === '0'} onChange={this.handleRadio} />
                <label className="radio-inline radiobox" htmlFor="radio-unlimited">unlimited</label>
              </div>
            </div>
          </div>

          <button className="btn btn-search"><i className="fa fa-search" aria-hidden="true"></i>&nbsp;Search</button>
        </form>
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
    if(listResultsCombined.length == 0){
      listResultsCombined = [<ResultsEmpty />];
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

ReactDOM.render(<ResultsApp />, document.getElementById('app'));
