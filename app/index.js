var React = require('react');
var ReactDOM = require('react-dom');
var fetchJsonp = require('fetch-jsonp');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var Moment = require('moment');
var Typeahead = require('react-bootstrap-typeahead').Typeahead;

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
      PASSED: false,
      FAILED: false,
      NEEDS_INSPECTION: false,
      INFO: false,
      since: '31'
    };
  },

  handleSearch: function(event){
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

  render: function(){
    //fixme...
    var testcases = ["depcheck", "rpmlint", "upgradepath", "dist.abicheck", "dist.depcheck", "dist.modulemd", "dist.python-versions", "dist.rpmdeplint", "dist.rpmgrill", "dist.rpmlint", "dist.upgradepath", "scratch.dockerautotest", "scratch.libabigail", "scratch.test atomic image with upstram ansible tests", "scratch.test httpd docker image", "dist.rpmgrill.build-log", "dist.rpmgrill.desktop-lint", "dist.rpmgrill.elf-checks", "dist.rpmgrill.lib-gather", "dist.rpmgrill.man-pages", "dist.rpmgrill.manifest", "dist.rpmgrill.multilib", "dist.rpmgrill.patches", "dist.rpmgrill.rpm-scripts", "dist.rpmgrill.security-policy", "dist.rpmgrill.setxid", "dist.rpmgrill.spec-file-encoding", "dist.rpmgrill.spec-file-sanity", "dist.rpmgrill.virus-check", "scratch.atomic-host-tests.admin-unlock", "scratch.atomic-host-tests.docker", "scratch.atomic-host-tests.improved-sanity-test", "scratch.atomic-host-tests.k8-cluster", "scratch.atomic-host-tests.multiple-rollback", "scratch.atomic-host-tests.multiple-rollback-reboot", "scratch.atomic-host-tests.new-image-smoketest", "scratch.atomic-host-tests.new-tree-smoketest", "scratch.atomic-host-tests.pkg-layering", "scratch.atomic-host-tests.rollback-interrupt", "scratch.atomic-host-tests.system-containers", "scratch.atomic-host-tests.unique-machine-id", "scratch.atomic-host-tests.upgrade-interrupt", "dist.modulemd.check_modulemd.ModulemdTest.test_api", "dist.modulemd.check_modulemd.ModulemdTest.test_component_availability", "dist.modulemd.check_modulemd.ModulemdTest.test_components", "dist.modulemd.check_modulemd.ModulemdTest.test_debugdump", "dist.modulemd.check_modulemd.ModulemdTest.test_dependencies", "dist.modulemd.check_modulemd.ModulemdTest.test_description", "dist.modulemd.check_modulemd.ModulemdTest.test_description_spelling", "dist.modulemd.check_modulemd.ModulemdTest.test_rationales", "dist.modulemd.check_modulemd.ModulemdTest.test_rationales_spelling", "dist.modulemd.check_modulemd.ModulemdTest.test_summary", "dist.modulemd.check_modulemd.ModulemdTest.test_summary_spelling"];

    return (
      <div id="search-form-wrapper" className="text-left">
        <div id="search-form-header" className="text-left">&nbsp;&nbsp;<i className="fa fa-search" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;search</div>
        <form className="search-form" onSubmit={this.handleSearch}>
          <input className="form-control" id="search-items" placeholder="items" name="items" value={this.state.items} onChange={this.handleText}/>
          <br />
          <Typeahead options={testcases} minLength={1} multiple allowNew newSelectionPrefix="" placeholder="testcases" onChange={this.handleTestcases}/>
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
        <span className="radio-inline radiobox" htmlFor={this.props.name}>{this.props.label}</span>
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

ReactDOM.render(<ResultsApp />, document.getElementById('app'));
