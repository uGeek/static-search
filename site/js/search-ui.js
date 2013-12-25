/** @jsx React.DOM */
/*!
 * StaticSearch (c) 2013 Dmitry Chestnykh | BSD License
 * https://github.com/dchest/static-search
 */

// <SearchStatus results>
// results - array of search results.
//
var SearchStatus = React.createClass({displayName: 'SearchStatus',
  render: function() {
    var r = this.props.results,
        msg;
    if (r && r.length > 0) {
      msg = 'Found ' + r.length + ' result' + (r.length > 1 ? 's' : '');
    } else {
      msg = 'No results found';
    }
    return React.DOM.div( {className:"search-status"}, msg);
  }
});

// <SearchPagination onNavigate pageNum>
// onNavigate - function called with page number to navigate to.
// pageNum - current page number.
//
var SearchPagination = React.createClass({displayName: 'SearchPagination',
  render: function () {
    var props = this.props;
    var createItem = function(text, num) {
      var className = React.addons.classSet({
        'active': (num === props.pageNum),
        'disabled': (num < 1 || num > props.pageCount)
      });
      var tryNavigate = function () {
        if (num >= 1 && num <= props.pageCount) {
          props.onNavigate(num);
        }
      };
      return React.DOM.li( {className:className}, 
      React.DOM.a( {href:"javascript:;", onClick:tryNavigate}, text)
      )
    };
    var items = [];
    items.push(createItem('«', props.pageNum-1));
    for (var i = 1; i <= this.props.pageCount; i++) {
      items.push(createItem(i, i));
    }
    items.push(createItem('»', props.pageNum+1));
    return React.DOM.ul( {className:"pagination"}, items)
  }
});


// <SearchResults results>
// results - array of search results.
//
var SearchResults = React.createClass({displayName: 'SearchResults',
    resultsPerPage: 10,

    getInitialState: function() {
      return { pageNum: 1 };
    },
    
    onPageNavigate : function(n) {
      this.setState({ pageNum: n });
    },

    componentWillReceiveProps: function(nextProps) {
      this.setState({ pageNum: 1 });
    },

    render: function() {
      var allResults = this.props.results || [];
      var pageCount = Math.ceil(allResults.length / this.resultsPerPage);
      var pageResults = allResults.slice((this.state.pageNum-1)*this.resultsPerPage,
                                         (this.state.pageNum-1)*this.resultsPerPage + this.resultsPerPage);

      var createResult = function(res) {
        return React.DOM.li(null, 
                 React.DOM.div( {className:"search-result-title"}, 
                   React.DOM.a( {href:res.url}, res.title || res.url)
                 ),
                 React.DOM.div( {className:"search-result-url"}, 
                   res.url
                 )
               )
      }
      var createPagination = _.bind(function() {
        if (pageCount > 1) {
          return SearchPagination( {pageNum:this.state.pageNum,
                                   pageCount:pageCount,
                                   onNavigate:this.onPageNavigate} )
        }
      }, this)

      return React.DOM.div( {className:"search-results"}, 
               SearchStatus( {results:allResults} ),
               React.DOM.ul(null, pageResults.map(createResult)),
               createPagination()
             )
    }
});


// <Search>
//
var Search = React.createClass({displayName: 'Search',

  getInitialState: function() {
    return {query: "", results: []};
  },

  onQueryChange: function(e) {
    this.setState({
      query: e.target.value,
      results : this.props.searcher.search(e.target.value)
    });
  },

  render: function() {
    var searchResults = this.state.query
                          ? SearchResults( {results:this.state.results} )
                          : '';
    return React.DOM.div(null, 
              React.DOM.input( {type:"search",
                     className:"form-control search-query",
                     placeholder:"Search",
                     value:this.state.query,
                     onChange:this.onQueryChange} ),
               searchResults
           )
  }

});

function StaticSearchUI(elementOrQuery, searcher) {
  _.each(_.isString(elementOrQuery) ?
           document.querySelectorAll(elementOrQuery)
         : [ element ], function(el) {
           React.renderComponent(Search({searcher: searcher}), el);
         });
}
