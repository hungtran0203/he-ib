function LAB(ns, data, binder, pagingCollection, states){
  this.data = data;
  this.ns = ns;
  this.binder = binder?binder:new LABBinder();
  this.pagingCollection = pagingCollection?pagingCollection:{};
  this.states = states?states:{};
  this.enableTrigger = true;

  this.getFullNS = function(ns){
    ns = lab.joinNs(this.ns, ns);
    return ns.join('.');
  }
  this.getParentNS = function(ns){
    ns = lab.joinNs(this.ns, ns);
    ns.splice(-1, 1)
    return ns.join('.');
  }
  this.getShortNS = function(ns){
    ns = lab.joinNs(this.ns, ns);
    ns = ns.splice(-1, 1)
    return ns.join('.');    
  }
  this.setState = function(key, val){
      this.states[key] = val;
      //refresh dta on save
      this.setVal(this.getVal());
      return this;
  }
  this.getState = function(key, def){
    return (this.states[key] === undefined)?def:this.states[key];
  }
  this.quite = function(){
    var silentLab =  new LAB(this.ns, this.data, this.binder, this.pagingCollection, this.states);
    silentLab.enableTrigger = false;
    return silentLab;
  }
  this.get = function(ns, defVal){
    ns = lab.joinNs(this.ns, ns);
    var val = lab.get(ns, this.data, defVal)
    this.dispatch(ns, 'get', [this]);
    return val;
  }
  this.set = function(ns, val){
    ns = lab.joinNs(this.ns, ns);
    var oldVal = this.quite().get(ns);
    lab.set(ns, this.data, val);
    this.dispatch(ns, 'set', [this, oldVal, val]);
    return this;
  }
  this.refresh = function(){
    this.set('', this.getVal())
  }
  this.push = function(ns, val, pos){
    var target = this.get(ns, null);
    if(!Array.isArray(target)) {
      target = [];
    }
    if(pos === undefined || pos > target.length){
      pos = target.length
    }
    target.splice(pos, 0, val);
    this.set(ns, target)
    return pos;
  }
  this.clear = function(ns){
    ns = lab.joinNs(this.ns, ns);
    var oldVal = this.quite().get(ns);
    lab.clear(ns, this.data);
    this.dispatch(ns, 'clear', [this, oldVal]);
    return this;
  }
  this.has = function(ns){
    ns = lab.joinNs(this.ns, ns);
    return lab.has(ns, this.data);
  }
  this.bind = function(ns, action, cb, waitForToken){
    ns = lab.joinNs(this.ns, ns);
    return lab.bind(ns, action, cb, waitForToken, this.binder);
  }
  this.unbind = function(token){
    return this.binder.unbind(token);
  }
  this.link = function(ns){
    ns = lab.joinNs(this.ns, ns);
    var linkLab = new LAB(ns.join('.'), this.data, this.binder, this.pagingCollection, this.states);
    return linkLab;
  }
  this.getVal = function(){
    if(this.ns === '' || this.ns === null) {
      this.dispatch(this.ns, 'get', [this]);
      return this.data;
    } else {
      this.dispatch(this.ns, 'get', [this]);
      return lab.get(this.ns, this.data, null);          
    }
  }
  this.setVal = function(val){
   return this.set('', val);
  }
  this.setPaging = function(ns, paging){
    ns = lab.joinNs(this.ns, ns);
    this.pagingCollection[ns.join('.')] = paging;
    return this;
  }
  this.getPaging = function(ns, def){
    ns = lab.joinNs(this.ns, ns);
    return this.pagingCollection[ns.join('.')];
  }
  this.hasPaging = function(ns){
    var p = this.getPaging(ns, null)
    return p === null?false:true;
  }
  this.dispatch = function(ns, action, args){
    if(this.enableTrigger){
      this.binder.dispatch(ns, action, args);
    }
    return this;
  }
  return this;
}

function LABPaging(data){
  this.data = data?data:{};
  this.status = 'ready';
  this.errMsg = '';
  this.pages = [];  //pages must be sort matter
  this.getData = function(prop, def){
    return this.data[prop]?this.data[prop]:def;
  }
  this.setData = function(prop, val){
    this.data[prop] = val;
    return this;
  }
  this.setStatus = function(status){
    this.status = status;
    return this;
  }
  this.getStatus = function(){
    return this.status;
  }
  this.hasStatus = function(status){
    return (this.getStatus() === status);
  }
  this.hasNext = function(){
    return (this.hasStatus('done') && this.getData('next'))
  }
  this.hasPrevious = function(){
    return (this.hasStatus('done') && this.getData('previous'))
  }
  this.addPage = function(offset, length){
    var pIndex = this.getPageIndex(offset, length);
    if(!this.hasPage(offset, length)){
      this.pages.push(pIndex);
    }
  }
  this.removePage = function(offset, length){
    var pIndex = this.getPageIndex(offset, length);
    var found = this.pages.indexOf(pIndex);
    if(found >= 0){
      this.pages = this.pages.slice(found, 1);
    }
  }
  this.hasPage = function(offset, length){
    var pIndex = this.getPageIndex(offset, length);
    return (this.pages.indexOf(pIndex) > -1)?true:false;
  }
  this.getPageIndex = function(offset, length){
    return '' + offset + '_' + length;
  }
}

function LABBinderToken(ns, cb, waitForToken){
  this.cb = cb;
  this.ns = Array.isArray(ns)?ns.join('.'):ns;
  this.waitForToken = waitForToken;
  this.tokenId = lab.getTokenId('lab');
  this.binderRef = {};
  this.getToken = function(){
    return this.tokenId;
  }
  this.match = function(ns){
    var regStr = Array.isArray(this.ns)?this.ns.join('.'):this.ns;
    regStr = regStr.replace(/\./g, '\\.').replace(/\*/g, '\\.*')
    var searchStr = Array.isArray(ns)?ns.join('.'):ns;
    var reg = new RegExp(regStr, 'i');
    return (searchStr.match(reg) || (searchStr + '.').match(reg))?true:false;
  }
  //keep track binders point for unbind purpose
  this.setBinderRef = function(action){
    this.binderRef.action = action;
  }
  this.getBinderRef = function(){
    return this.binderRef;
  }
  return this;
}

function LABBinder(){
  this.binders = {'get':{}, 'set':{}, 'clear':{}};
  this.bind = function(ns, action, cb, waitForToken){
    if(this.binders[action]){
      var token = new LABBinderToken(ns, cb, waitForToken)
      this.binders[action][token.getToken()] = token;
      token.setBinderRef(action);
      return token;
    }
    return null;
  }
  this.unbind = function(token){
    if(token){
      var binderRef = token.getBinderRef();
      if(this.binders[binderRef.action] && this.binders[binderRef.action][token.getToken()]){
        delete this.binders[binderRef.action][token.getToken()];
      }
    }
  }
  this.dispatch = function(ns, action, args){
    //find the binded token
    if(this.binders[action]){
      var tokens = this.binders[action];
      var bindedTokenIds = Object.getOwnPropertyNames(tokens).filter(function(tokenId){
        return tokens[tokenId].match(ns);
      });
      bindedTokenIds.forEach(function(tokenId){
        if(tokens[tokenId] && tokens[tokenId].cb){
          tokens[tokenId].cb.apply(tokens[tokenId], args);
        }
      })
    }
  }
}

var lab = {
  currToken : 0,
  init: function(data){
    return new LAB('', data);
  },
  get: function(ns, data, defVal){
    var levels = lab.parseNs(ns);
    if(levels.length) {
      for(var i = 0; i < levels.length - 1; i++){
        data = data[levels[i]]?data[levels[i]]:{};
        if(data instanceof LAB) {
          var subNs = levels.slice( i + 1 );
          return data.get(subNs, defVal);
        }
      }
      var ref = levels[levels.length - 1];
      return (data[ref] !== undefined)?data[ref]:defVal;
    }
    return defVal;
  },
  set: function(ns, data, val){
    var levels = lab.parseNs(ns);
    if(levels.length) {
      for(var i = 0; i < levels.length - 1; i++){
        if(!data[levels[i]]){
          data[levels[i]] = {};
        }
        data = data[levels[i]];
        if(data instanceof LAB) {
          var subNs = levels.slice( i + 1 );
          return data.set(subNs, val);
        }
      }        
      var ref = levels[levels.length - 1];
      data[ref] = val;
    }
  },
  clear: function(ns, data){
    var levels = lab.parseNs(ns);
    if(levels.length) {
      for(var i = 0; i < levels.length - 1; i++){
        if(!data[levels[i]]){
          data[levels[i]] = {};
        }
        data = data[levels[i]];
        if(data instanceof LAB) {
          var subNs = levels.slice( i + 1 );
          return data.clear(subNs);
        }
      }        
      var ref = levels[levels.length - 1];
      if(Array.isArray(data)){
        data.splice(ref, 1);
      } else {
        delete data[ref];
      }
    }
  },
  has: function(ns, data){
    var levels = lab.parseNs(ns);
    if(levels.length) {
      for(var i = 0; i < levels.length; i++){
        if(typeof data[levels[i]] === 'undefined'){
          return false;
        }
        data = data[levels[i]];
        if(data instanceof LAB) {
          var subNs = levels.slice( i + 1 );
          return data.has(subNs);
        }
      }
      return true;
    }
    return defVal;      
  },
  bind: function(ns, action, cb, waitForToken, binder){
    return binder.bind(ns, action, cb, waitForToken);
  },
  joinNs: function(baseNs, ns){
    var join = [];
    baseNs = lab.parseNs(baseNs);
    ns = lab.parseNs(ns);
    Array.prototype.push.apply(join, baseNs);
    Array.prototype.push.apply(join, ns);
    return join;
  },
  parseNs: function(ns){
    if(Array.isArray(ns)){
      return ns;
    } else if (typeof ns === 'string' && ns !== '') {
      return ns.split('.');
    } else if(typeof ns === 'number'){
      return [ns];
    } else {
      return [];
    }
  },
  getTokenId: function(prefix){
    ++lab.currToken;
    return prefix?prefix + '_' + lab.currToken:lab.currToken;
  },
  getPagingInstance: function(data){
    return new LABPaging(data);
  }
};


module.exports = lab;
