var React = require('react');
var fetchJsonp = require('fetch-jsonp');
var queryString = require('query-string');
var Search = require("../components/search").Search;
var Results = require("../components/results").Results;


export var ResultsApp = React.createClass({
  getInitialState: function() {
    //hm?
    //this.loadMore = this.loadMore.bind(this);

    //this.refresh();
    return {
      results: [],
      urlBase: 'http://taskotron.fedoraproject.org/resultsdb_api/api/v2.0/results',
      urlQuery: "",
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
    if($.isEmptyObject(queryString.parse(location.search))) {
      this.refresh();
    }
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