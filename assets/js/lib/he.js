if(!window.HE) {
	var HE = {};

HE.init = function(){
	HE.UI.init();
	HE.hook.init();
}
//////////////////////////////////// UI ////////////////////////////////////////
HE.UI = {
	setMixins: function(name, mixin){
    if(!HE.UI.mixins){HE.UI.mixins = {};}
    if(!HE.UI.mixins[name]) {
      HE.UI.mixins[name] = mixin;
    }
  },
  getMixins: function(name){
		return HE.UI.mixins[name];
  },
  loadMixins: function(){
		HE.UI.setMixins('lab', require('../mixins/lab.js'))
		HE.UI.setMixins('common', require('../mixins/common.js'))
		HE.UI.setMixins('input', require('../mixins/input.js'))
		HE.UI.setMixins('user', require('../mixins/user.js'))
		HE.UI.setMixins('responsive', require('../mixins/responsive.js'))
  },
  setComponent: function(name, component){
    if(!HE.UI.components){HE.UI.components = {};}
    if(!HE.UI.components[name]) {
      HE.UI.components[name] = component;
    }
  },
  loadComponents: function(){
		HE.UI.setComponent('Form', require('../components/Form.jsx'))
		HE.UI.setComponent('Grid', require('../components/Grid.jsx'))
		HE.UI.setComponent('Block', require('../components/Block.jsx'))
		HE.UI.setComponent('Panel', require('../components/Panel.jsx'))

  },
  init: function(){
  	if(!HE.UI.inited){
  		//load mixins
    	HE.UI.loadMixins();
    	//load components
    	HE.UI.loadComponents();
    	HE.lab = require('./lab.js');
    	HE.UI.inited = true;      		
  	}
  },
  inited: false
}
//////////////////////////////////// UI ////////////////////////////////////////

////////////////////////////////// Utils ///////////////////////////////////////
HE.utils = {
	getData: function(ui, name, def){
		return (typeof ui.props['data-' + name] !== 'undefined')?ui.props['data-' + name]:def;
	},
	changeCssAttr: function(strVal, strAdjust){
		if(strVal === undefined) return strAdjust;
		var val = parseFloat(strVal);
		var adjust = parseFloat(strAdjust);
		var rtn = val + adjust;
		if(typeof strVal === 'number') {
			return rtn;
		}
		var strValOnly = '' + val;
		return '' + rtn + strVal.substring(strValOnly.length);
	},
	isLab: function(obj){
		if(typeof obj !== 'object'){
			return false;
		} else {
			if(obj.constructor.name && obj.constructor.name !== 'LAB'){
				return false;
			}
 			return true;  				
		}
	},
	componentMapping: {
		'container.absolute': 'HE.UI.components.Block.Container.Absolute',
		'container.vertical': 'HE.UI.components.Block.Container.Vertical',
		'container.horizontal': 'HE.UI.components.Block.Container.Horizontal',
		content: 'HE.UI.components.Block.Content',
	},
	getComponentByBlockType: function(blockType, mode){
		var componentName = 'HE.UI.components.Block.Content';
		if(HE.utils.componentMapping[blockType] !== undefined) {
			componentName = HE.utils.componentMapping[blockType]
		}
		//resolve component name to component object
		var parts = componentName.split('.');
		parts.push(mode);
		var componentObj = window;
		for(var i = 0; i < parts.length; i++){
			if(componentObj[parts[i]] !== undefined) {
				componentObj = componentObj[parts[i]];
			} else {
				return null;
			}
		}
		return componentObj;
	},
	getComponentFromStr: function(componentName){
		var parts = componentName.split('.');
		var componentObj = window;
		for(var i = 0; i < parts.length; i++){
			if(componentObj[parts[i]] !== undefined) {
				componentObj = componentObj[parts[i]];
			} else {
				return null;
			}
		}
		return componentObj;
	},
	currentTabIndex: 0,
	getTabIndex: function(){
		return HE.utils.currentTabIndex ++;
	},
	ajax: function(params, successCb, failCb){
		//setup midleware hook
		setTimeout(function(){
			var resp = {data:'<span>this is my data</span>'}
			successCb(resp)
		}, 100);
	},
	nextTick: function(fn){
		setTimeout(fn, 10);
	},
	focusInput: function(name){
		var input = jQuery("[name=\"" + name + "\"]");
		console.log(input)
		input.focus()
	}
}
////////////////////////////////// Utils ///////////////////////////////////////

//////////////////////////////// Hook__Filter //////////////////////////////////
HE.hook = {
	defaultPriority: 10,
	filters:[],
	currentFilterStack: [],
	init: function(){

	},
	resolve_queue: function($tag, $priority){
		if(!$tag) return null;
		$priority = $priority || HE.hook.defaultPriority;

		var $filters = HE.hook.resolve_filters($tag);
		if($filters[$priority] === undefined){
			$filters[$priority] = [];
		}
		return HE.hook.filters[$tag][$priority];
	},
	resolve_filters: function($tag){
		if(!$tag) return null;
		if(HE.hook.filters[$tag] === undefined){
			HE.hook.filters[$tag] = [];
		}
		return HE.hook.filters[$tag];
	},
	apply_filters: function($tag, $value){
		var $filters = HE.hook.resolve_filters($tag);
		var $orderedFilters = [];
		$filters.map(function(queue, key){
			$orderedFilters.push(queue)
		})
		//push the current filter tag
		HE.hook.currentFilterStack.push($tag);

		for(var i = $orderedFilters.length - 1; i >= 0;i--){
			for(var j = 0; j < $orderedFilters[i].length; j++){
				var fn
				if($orderedFilters[i][j].funcName !== undefined){
					fn = HE.utils.getComponentFromStr($orderedFilters[i][j].funcName);
				} else if($orderedFilters[i][j].func !== undefined){
					fn = $orderedFilters[i][j].func;
				}
				if(typeof fn === 'function'){
					$value = fn($value);
				}
			}
		}
		//pop the current filter tag
		HE.hook.currentFilterStack.pop();
		return $value;
	},
	add_filter: function($tag, $function_to_add, $priority, $accepted_args){
		$accepted_args = $accepted_args || 1;
		var $queue = HE.hook.resolve_queue($tag, $priority);
		if($queue === null){
			return false;
		}

		var filterObj = {'accepted_args': $accepted_args};
		switch(typeof $function_to_add){
			case 'string':
				filterObj.funcName = $function_to_add;
				break;
			case 'function':
				filterObj.func = $function_to_add;
		}
		$queue.push(filterObj);
		return true;
	},
	remove_filter: function($tag, $function_to_remove, $priority){
		var $queue = HE.hook.resolve_queue($tag, $priority);
		for(var j = 0; j < $queue.length; j++){
			if(isFuncName && $queue[j].funcName !== undefined){
				$queue.splice(j, 1);
			} else if(!isFuncName && $orderedFilters[i][j].func !== undefined){
				$queue.splice(j, 1);
			}
		}

	},
	has_filter: function($tag, $function_to_check){
		var $filters = HE.hook.resolve_filters($tag);
		var $hasFilter = false;
		var isFuncName = (typeof $function_to_check === 'string')
		//convert to string for compare purpose
		$function_to_check = '' + $function_to_check;
		$filters.map(function($queue, key){
			for(var j = 0; j < $queue.length; j++){
				if(isFuncName && $queue[j].funcName !== undefined){
					if($queue[j].funcName === $function_to_check) $hasFilter = true;
				} else if(!isFuncName && $orderedFilters[i][j].func !== undefined){
					if('' + $queue[j].func == $function_to_check) $hasFilter = true;
				}
			}
		})
		return $hasFilter;
	},
	remove_all_filters: function($tag, $priority){
		var $queue = HE.hook.resolve_queue($tag, $priority);
		$queue.splice(0, $queue.length)
	},
	current_filter: function(){
		if(!HE.hook.currentFilterStack.length){
			return null;
		} else {
			return HE.hook.currentFilterStack[HE.hook.currentFilterStack.length - 1]
		}
	},
	do_action: function($tag){
		var $filters = HE.hook.resolve_filters($tag);
		var $orderedFilters = [];
		$filters.map(function(queue, key){
			$orderedFilters.push(queue)
		})
		//push the current filter tag
		HE.hook.currentFilterStack.push($tag);

		for(var i = $orderedFilters.length - 1; i >= 0;i--){
			for(var j = 0; j < $orderedFilters[i].length; j++){
				var fn
				if($orderedFilters[i][j].funcName !== undefined){
					fn = HE.utils.getComponentFromStr($orderedFilters[i][j].funcName);
				} else if($orderedFilters[i][j].func !== undefined){
					fn = $orderedFilters[i][j].func;
				}
				if(typeof fn === 'function'){
					var $fnArgs = Array.prototype.slice.call(arguments, 1)
					fn.apply(undefined, $fnArgs);
				}
			}
		}
		//pop the current filter tag
		HE.hook.currentFilterStack.pop();
	},
	add_action: function($tag, $function_to_add, $priority, $accepted_args){
		return HE.hook.add_filter($tag, $function_to_add, $priority, $accepted_args)
	},
	remove_action: function($tag, $function_to_remove, $priority){
		return He.hook.remove_filter($tag, $function_to_remove, $priority);
	},
	has_action: function($tag, $function_to_check){
		return HE.hook.has_filter($tag, $function_to_check);
	},
	remove_all_actions: function($tag, $priority){
		return HE.hook.remove_all_filters($tag, $priority);
	},
	current_action: function(){
		return HE.hook.current_action();
	}
}	
//////////////////////////////// Hook__Filter //////////////////////////////////	
	window.HE = HE;
} else {
	var HE = window.HE;
}

module.exports = HE;
