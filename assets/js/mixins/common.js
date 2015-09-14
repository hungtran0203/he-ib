var React = require('react/addons');
var commonMixins = {
      //bind change on a HEState
      bindHEState: function(stateName){
        var self = this;
        HE.hook.add_action('changedHEState__' + stateName, function(){
          self.forceUpdate();
        })
      },
  		getClass: function(className){
			  var classes = {};
			  classes[className] = true;
			  if(this.props.class){
				  classes[this.props.class] = true;
			  }
			  if(this.props.className){
				  classes[this.props.className] = true;
			  }
			  return React.addons.classSet(classes);
  		},
  		hasTitle:  function(){
  			return this.props.title?true:false;
  		},
  		getTitle:  function(){
  			if(typeof this.props.title === 'object'){
  				return this.props.title.getVal();
  			}
  			return this.props.title;
  		},
  		getValue:  function(){
  			if(typeof this.props.value === 'object'){
  				return this.props.value.getVal();
  			}
  			return this.props.value;
  		},
  		setValue: function(val){
  			if(typeof this.props.value === 'object'){
  				return this.props.value.setVal(val);
  			}
  			else if(typeof this.props.value !== 'undefined') {
	  			this.props.value = val;
  			}
  		},
  		getData: function(name, def){
  			return (typeof this.props['data-' + name] !== 'undefined')?this.props['data-' + name]:def;
  		},
  		except: function(exceptedOpts){
  			return _.omit(this.props, exceptedOpts);
  		},
      getTabIndex: function(){
        if(this.tabIndex === undefined){
          this.tabIndex = HE.utils.getTabIndex();  
        }
        return this.tabIndex;
      },

      //for content components
      getContentNS: function(){
        return this.getLab().getFullNS('content');
      },
      setContent: function(content){
        //init blockContentLab if not exists
        if(!window.he_blockContentLab){
          window.he_blockContentLab = HE.lab.init({}).quite();
        }
        window.he_blockContentLab.set(this.getContentNS(), content);
      },
      hasContent: function(){
        //init blockContentLab if not exists
        if(!window.he_blockContentLab){
          window.he_blockContentLab = HE.lab.init({}).quite();
        }
        return (window.he_blockContentLab.get(this.getContentNS()) !== undefined);
      },
      isExpiredContent: function(){
        return false;
      },
  	}

module.exports = commonMixins;
