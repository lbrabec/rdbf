var React = require('react');
var ReactDOM = require('react-dom');
var Router = require('react-router').Router
var Route = require('react-router').Route
var Link = require('react-router').Link
var Redirect = require('react-router').Redirect
var browserHistory = require('react-router').browserHistory
var fetchJsonp = require('fetch-jsonp');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var Moment = require('moment');
var Typeahead = require('react-bootstrap-typeahead').Typeahead;
var queryString = require('query-string');
var DatePicker = require('react-datepicker');

require('react-datepicker/dist/react-datepicker.css');

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
    history.pushState(null,null,"/results"+url);
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
    fetchJsonp("https://taskotron.fedoraproject.org/resultsdb_api/api/v2.0/testcases?limit=1000")
    .then(function(response) {
      return response.json()
    }).then(function(json) {
      this.setState({tokens: json.data.map(function(tc){return tc.name})});
    }.bind(this))
    .catch(function(ex) {
      console.log('parsing failed', ex)
    });

    const query = queryString.parse(location.search)
    console.log(query);
    if(!$.isEmptyObject(query)){}
    return {
      items: ("item:like" in query)? query["item:like"].replace("%","*") : "", //FIXME!!
      testcases: ("testcases:like" in query)? query["testcases:like"] : "",
      PASSED: ("outcome" in query)? query.outcome.includes('PASSED') : false,
      FAILED: ("outcome" in query)? query.outcome.includes('FAILED') : false,
      NEEDS_INSPECTION: ("outcome" in query)? query.outcome.includes('NEEDS_INSPECTION') : false,
      INFO: ("outcome" in query)? query.outcome.includes('INFO') : false,
      since: ("since" in query)? "custom" : "31",
      tokens: [],
      sinceDate: ("since" in query)? Moment(query.since) : "",
      doInitialSearch: !$.isEmptyObject(query)
    };
  },

  componentDidMount: function(){
    setTimeout(function(){ if(this.state.doInitialSearch) this.handleSearch(); }.bind(this), 1000); //FIXME remove timeout and ensure refresh is not invoked
  },

  handleSearch: function(event = {"preventDefault": function(){}}){
    event.preventDefault();
    var outcomes = ['PASSED', 'FAILED', 'NEEDS_INSPECTION', 'INFO'].filter(function(outcome){
      //const key = "outcome"+outcome[0];
      return this.state[outcome];
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
      if(this.state.since == "custom"){
        url = url+"&since="+this.state.sinceDate.toISOString();
      } else {
        url = url+"&since="+Moment().subtract(this.state.since, 'days').toISOString();
      }
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

  handleTestcases: function(selected){
    if(selected.length == 0){
      selected = [""];
    } else {
      selected = selected.map(function(s){
        return typeof(s) === 'string'? s : s.label
      });
    }
    console.log(selected.reduce(function(a,b){return a+","+b}));
    this.setState({
      testcases: selected.reduce(function(a,b){return a+","+b})
    });
  },

  handleDate: function(date) {
    this.setState({
      sinceDate: date
    });
  },

  render: function(){
    
    return (
      <div id="search-form-wrapper" className="text-left">
        <div id="search-form-header" className="text-left">&nbsp;&nbsp;<i className="fa fa-search" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;search</div>
        <form className="search-form" onSubmit={this.handleSearch}>
          <input className="form-control" id="search-items" placeholder="items" name="items" value={this.state.items} onChange={this.handleText}/>
          <br />
          <Typeahead options={this.state.tokens} minLength={1} multiple allowNew newSelectionPrefix="" placeholder="testcases" onChange={this.handleTestcases} selected={function(tcs){return tcs==""? [] : tcs.split(',')}(this.state.testcases)}/>
          <br />
          <div className="row">
            <div className="col-xs-6">
              Select outcomes:
              <div id="search-checkboxes">
                <Checkbox value="PASSED" checked={this.state.PASSED} handler={this.handleCheckbox}><Icon type="check-circle" />&nbsp;</Checkbox>
                <Checkbox value="FAILED" checked={this.state.FAILED} handler={this.handleCheckbox}><Icon type="times-circle" />&nbsp;</Checkbox>
                <Checkbox value="NEEDS_INSPECTION" checked={this.state.NEEDS_INSPECTION} handler={this.handleCheckbox}><Icon type="question-circle" />&nbsp;</Checkbox>
                <Checkbox value="INFO" checked={this.state.INFO} handler={this.handleCheckbox}><Icon type="info-circle" />&nbsp;</Checkbox>
              </div>
            </div>

            <div className="col-xs-6">
              Since:
              <div id="search-checkboxes">
                <Radio label="24 hours" value="1" checked={this.state.since} handler={this.handleRadio} />
                <Radio label="3 days" value="3" checked={this.state.since} handler={this.handleRadio} />
                <Radio label="a week" value="7" checked={this.state.since} handler={this.handleRadio} />
                <Radio label="a month" value="31" checked={this.state.since} handler={this.handleRadio} />
                <Radio label="unlimited" value="0" checked={this.state.since} handler={this.handleRadio} />
                <Radio label="custom" value="custom" checked={this.state.since} handler={this.handleRadio}>
                  <DatePicker onChange={this.handleDate} selected={this.state.sinceDate}/>
                </Radio>
              </div>
              
            </div>
          </div>

          <button className="btn btn-search"><i className="fa fa-search" aria-hidden="true"></i>&nbsp;Search</button>
        </form>
        
      </div>
    )
  }
});


var Icon = React.createClass({
  render: function(){
    return (
      <i className={"fa fa-"+this.props.type+" fa-fw"} aria-hidden="true"></i>
    )
  }
});

var Checkbox = React.createClass({
  render: function(){
    const name = "checkbox"+this.props.value.replace(" ", "");
    return (
      <label>
        <input type="checkbox" value={this.props.value} id={name} checked={this.props.checked} name={this.props.value} onChange={this.props.handler}/>
        <span className={"checkbox-inline checkbox "+this.props.value} htmlFor={name}>
          {this.props.children}{this.props.value}
        </span>
      </label>
    )
  }
});

var Radio = React.createClass({
  render: function(){
    const name = "radio"+this.props.label.replace(" ", "");
    //FIXME name should be the same?
    return (
      <label>
        <input type="radio" name={name} id={name} value={this.props.value} checked={this.props.checked === this.props.value} onChange={this.props.handler} />
        <span className="radio-inline radiobox" htmlFor={this.props.name}>{this.props.label}&nbsp;{this.props.children}</span>
      </label>
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

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/results" component={ResultsApp} />
    <Redirect from="/" to="/results" />
  </Router>
  , document.getElementById('app'));
