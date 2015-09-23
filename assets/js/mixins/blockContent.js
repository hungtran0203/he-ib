var React = require('react/addons');

var blockContentMixins = {
  getContent: function(){
    var content = this.getCachedContent();
    self = this;
    if(content === undefined){
      //show loading state
      content = React.createElement('div')
    } else {
      content = React.createElement('div', {dangerouslySetInnerHTML:{'__html':content}})
    }
    return content;
  },
  setContent: function(content){
    var key = this.getCachedContentKey();
    HE.cache.set(key, content);
    this.forceUpdate();
  },
  getCachedContent: function(){
    var key = this.getCachedContentKey();
    var content = HE.cache.remember(key, this.getContentLifeTime(), this.fetchContent);
    return content;
  },
  reloadContent: function(){
    var key = this.getCachedContentKey();
    HE.cache.forget(key);
    this.forceUpdate();
  },
  getCachedContentKey: function(){
    var labData = this.getLab().getVal();
    if(labData === null) {
      return '__null';
    }
    var key = this.getLab().getDataId();

    //content cache key is compound of data id and context id
    var contextId = HE.cache.rememberForever('heCurrentContextId', 'context');
    return '____cachedContentKey.' + contextId + '.' + key;
  },
  getContentLifeTime: function(){
    if(!this.contentLifeTime){
      var defaultLifeTime = 30000; //30 seconds
      this.contentLifeTime = HE.hook.apply_filters('getContentLifeTime', defaultLifeTime, this)
    }
    return this.contentLifeTime;
  },
  fetchContent: function(){
    var filterName = this.getLab().get('contentAction', null)
    var content
    if(filterName){
      content = HE.hook.apply_filters('fetchBlockContent__' + filterName, content, this);
    }
    return content;
  }
}

module.exports = blockContentMixins;