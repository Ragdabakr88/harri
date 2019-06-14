var client = algoliasearch('V7OVKGFP9W', '6b6848b55ecec53cccf031373712e47c');
var index = client.initIndex('postSchema');
//initialize autocomplete on search input (ID selector must match)
autocomplete('#aa-search-input',
{ hint: false }, {
    source: autocomplete.sources.hits(index, {hitsPerPage: 5}),
    //value to be displayed in input control after user's suggestion selection
    displayKey: 'name',
    //hash of templates used when rendering dataset
    templates: {
        //'suggestion' templating function used to render a single suggestion
        suggestion: function(suggestion) {
      return '<a href="/single/'+ suggestion.objectID+'"><span>' +
            suggestion._highlightResult.title.value + '</span></a>';
      
        }
    }
});