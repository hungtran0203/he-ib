var React = require('react/addons');
var commonMixins = {
      //bind change on a HEState
      bindHEState: function(stateName, cb){
        var self = this;
        HE.hook.add_action('changedHEState__' + stateName, function(){
          if(typeof cb === 'function'){
            cb()
          } else {
            self.forceUpdate();  
          }
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

      getTabIndex: function(){
        if(this.tabIndex === undefined){
          this.tabIndex = HE.utils.getTabIndex();
        }
        return this.tabIndex;
      }
  	}

module.exports = commonMixins;
