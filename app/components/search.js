var React = require('react');
var fetchJsonp = require('fetch-jsonp');
var Moment = require('moment');
var Typeahead = require('react-bootstrap-typeahead').Typeahead;
var queryString = require('query-string');
var DatePicker = require('react-datepicker');
var Icon = require("../components/icon").Icon;
var Config = require("../config/config").Config;

export var Search = React.createClass({
  getInitialState: function() {
    fetchJsonp(Config.TESTCASES)
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
    if(!$.isEmptyObject(queryString.parse(location.search))){}
    return {
      items: ("item:like" in query)? query["item:like"].replace("%","*") : "", //FIXME!!
      testcases: ("testcases:like" in query)? query["testcases:like"].replace("%","*") : "",
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
    if(this.state.doInitialSearch) this.handleSearch();
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
        <div id="search-form-header" className="text-left">&nbsp;&nbsp;<Icon type="search" />&nbsp;&nbsp;&nbsp;search</div>
        <form className="search-form" onSubmit={this.handleSearch}>
          <input className="form-control" id="search-items" placeholder="items" name="items" value={this.state.items} onChange={this.handleText} type="text" />
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
                <Radio label="24h" value="1" checked={this.state.since} handler={this.handleRadio} />
                <Radio label="3 days" value="3" checked={this.state.since} handler={this.handleRadio} />
                <Radio label="a week" value="7" checked={this.state.since} handler={this.handleRadio} />
                <Radio label="a month" value="31" checked={this.state.since} handler={this.handleRadio} />
                <Radio label="unlimited" value="0" checked={this.state.since} handler={this.handleRadio} />
                <Radio label="custom" value="custom" checked={this.state.since} handler={this.handleRadio}>
                  <DatePicker onChange={this.handleDate} selected={this.state.sinceDate} />
                </Radio>
              </div>
              
            </div>
          </div>

          <button className="btn btn-search"><Icon type="search" />&nbsp;Search</button>
        </form>
        
      </div>
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
    const checked = (this.props.checked === this.props.value);
    //FIXME name should be the same?
    return (
      <label>
        <input type="radio" name={name} id={name} value={this.props.value} checked={checked} onChange={this.props.handler} />
        <span className="radio-inline radiobox" htmlFor={this.props.name}>{this.props.label}<span className={checked? "":"hidden"}>{this.props.children}</span></span>
      </label>
    )
  }
});