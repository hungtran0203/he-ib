if(!window.HE) {
	var HE = {};

HE.init = function(){
	HE.UI.init();
	HE.hook.init();
	jQuery(document).trigger('he_inited');
}

HE.lab = require('./lab.js');
var React = require('react');

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
  setComponent: function(name, component){
    if(!HE.UI.components){HE.UI.components = {};}
    if(!HE.UI.components[name]) {
      HE.UI.components[name] = component;
    }
  },
  init: function(){
  	if(!HE.UI.inited){
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
		var data = jQuery.extend(true, {}, {'action': 'heib_ajax'}, params)
		//setup midleware hooks
		data = HE.hook.apply_filters('prepareAjaxData', data);

		jQuery.ajax({
        url: ajaxurl,
        data: data,
        success:function(data) {
            // This outputs the result of the ajax request
            var res = jQuery.parseJSON(data);
            if(res.error){
            	console.log(res.errMsg);
            	if(typeof failCb === 'function'){
	            	failCb(res)
            	}
            } else {
            	if(typeof successCb === 'function'){
	            	successCb(res);
            	}
            }
        },
        error: function(errorThrown){
            console.log(errorThrown);
          	if(typeof failCb === 'function'){
	            failCb();
          	}
        }
    });  
	},
	ajaxBatchHandler: function(args){
		var batchData = args.map(function(arg){
			return arg[0];
		});
		HE.utils.ajax({endpoint:'batch', batch: batchData}, 
										function(res){
											if(res && res.data && Array.isArray(res.data)){
												res.data.map(function(subRes, key){
													if(args[key][1] && typeof args[key][1] === 'function'){
														args[key][1](subRes);
													}
												});
											}
										}, 
										function(){
											if(Array.isArray(args[2])){
												args.map(function(arg){
													if(arg[2] && typeof arg[2] === 'function'){
														arg[2]();
													}
												});
											}
										})
	},
	staticBatchKeys: {},
	staticBatchCounters: {},
	getBatch: function(key, fun, delay, maxItemPerBatch){
		delay = delay || 30;
		if(!HE.utils.staticBatchKeys[key]){
			var args = [];
			var timer = null;
			HE.utils.staticBatchKeys[key] = function(){
				var context = this;
				args.push(Array.prototype.slice.call(arguments, 0));

				HE.utils.staticBatchCounters[key] = HE.utils.staticBatchCounters[key]?HE.utils.staticBatchCounters[key] + 1: 1;
				if(maxItemPerBatch && HE.utils.staticBatchCounters[key] >= maxItemPerBatch){
						//max item per batch reached, execute without waiting
						fun.apply(context, [args]);
						delete HE.utils.staticBatchKeys[key];
						if(timer === null){
							clearTimeout(timer);
						}
						//reset enviroment
						timer = null;	//reset timer	
						HE.utils.staticBatchCounters[key] = 0;				
				} else if (timer === null){
					timer = setTimeout(function () {
						fun.apply(context, [args]);
						delete HE.utils.staticBatchKeys[key];
						timer = null;	//reset timer
					}, delay);					
				}
			}			
		}
		return HE.utils.staticBatchKeys[key];
	},
	throttle: function (fun, delay) {
		var timer = null;

		return function () {
			var context = this, args = arguments;

			clearTimeout(timer);
			timer = setTimeout(function () {
				fun.apply(context, args);
			}, delay);
		};
	},
	lockFunction: function (fun, delay) {
		var lock = null;
		var timer = null;
		return function () {
			var context = this, args = arguments;
			if (!lock) {
				fun.apply(context, args);
				lock = true;
			}
			clearTimeout(timer);
			timer = setTimeout(function () {
				lock = false;
			}, delay);
		};
	},
	staticThrottleKeys: {},
	getThrottle: function(key, func, delay) {
		if(typeof key === 'function'){
			return HE.utils.throttle(key, func)
		}
		if(!HE.utils.staticThrottleKeys[key]){
			HE.utils.staticThrottleKeys[key] = HE.utils.throttle(func, delay);
		}
		return HE.utils.staticThrottleKeys[key];
	},
	staticLockKeys: {},
	getLock: function(key, func, delay){
		if(typeof key === 'function'){
			return HE.utils.throttle(key, func)
		}
		if(!HE.utils.staticLockKeys[key]){
			HE.utils.staticLockKeys[key] = HE.utils.lockFunction(func, delay);
		}
		return HE.utils.staticLockKeys[key];
	},
	nextTick: function(fn){
		setTimeout(fn, 10);
	},
	focusInput: function(name){
		var input = jQuery("[name=\"" + name + "\"]");
		input.focus()
	},
	focusBlock: function(element){
    jQuery('.he-focus').removeClass('he-focus');
    jQuery(element).addClass('he-focus')
	},
	cssTextToReactObject: function(cssText){
    var camelCase = require('camel-case');
		var quote = require('quote')({quotes: '"'});
		var jsStringEscape = require('js-string-escape');
		
		var rtnObj = {};

		cssText.split('\n')
					.join(' ')
					.split(';')
					.filter(function(line){
						return (line !== undefined && line !== '')
					})
					.map(function(line){
								var parts = line.split(':');
						    var key = camelCase(parts[0]);
						    var value = parts[1];
						    if (value === '@light') {
						        value = 'weight.light';
						    } else if (value === '@regular') {
						        value = 'weight.regular';
						    } else if (value === '@medium') {
						        value = 'weight.medium';
						    }

						    rtnObj[key] = String(value).trim();
						    return {key:value};
    					})
		return rtnObj;
	},
	camelCaseToDash: function(camelCase){
		return camelCase.replace(/\.?([A-Z])/g, function (x,y){return "-" + y.toLowerCase()})
	},
	resolveValueInData: function(val, data){
		var ns = null;
		if(typeof data === 'object'){
			for(var key in data){
				if(data[key] === val) {
					return key;
				} else {
					var found = HE.utils.resolveValueInData(val, data[key])
					if(found !== null) {
						return key + '.' + found;
					}
				}
			}
		}
		return ns;
	},
	setDelayState: function(stateName, cb, delay){
		HE.cache.set('delayState_' + stateName, 1, delay);
		setTimeout(function(){
			var state = HE.cache.get('delayState_' + stateName);
			if(state){
				cb();
			}
		}, delay - 50);
	},
	clearDelayState: function(stateName){
		HE.cache.forget('delayState_' + stateName);
	},
	hashCode: function(str) {
	  var hash = 0, i, chr, len;
	  if (str.length == 0) return hash;
	  for (i = 0, len = str.length; i < len; i++) {
	    chr   = str.charCodeAt(i);
	    hash  = ((hash << 5) - hash) + chr;
	    hash |= 0; // Convert to 32bit integer
	  }
	  return hash;
	},
	getScreenSize: function(){
		// var width = window.innerWidth ||
		//                       document.documentElement.clientWidth ||
		//                       document.body.clientWidth ||
		//                       document.body.offsetWidth;
		var width = jQuery(window).width();
		var height = jQuery(window).height();
		return {width: width, height: height};
	},
}
////////////////////////////////// Utils ///////////////////////////////////////

////////////////////////////////// Box ///////////////////////////////////////
HE.box = {
	updateBoxPosition: function($ele, $box){
		var bottomMargin = 28;	//margin between ele and box
		var topMargin = 18;	//margin between ele and box
		var offset = $ele.offset();
		var screenSize = HE.utils.getScreenSize();
		//get ele position related to  window
		var elePosWindow = {top: offset.top - jQuery(window).scrollTop(), left: offset.left - jQuery(window).scrollLeft()};
		var placement, direction, top, left
		$box.css('visibility', 'hidden');
		$box.show();
		var $content = $box.find('.he-Box.__View')
		//calculate placement
		//rule 1: prefer 'bottom'
		if(elePosWindow.top < (screenSize.height / 2)){
			placement = 'bottom';
			top = offset.top + bottomMargin
		} else {
			placement = 'top';
			top = offset.top - topMargin - $content.height()
		}
		//calculate box top position
		
		//rule 2: prefer 'right'
		if(elePosWindow.left < (screenSize.width /2)){
			direction = 'right';
			left = offset.left
		} else {
			direction = 'left';
			if($ele.width() > $content.width()){
				left = offset.left
			} else {
				left = offset.left + $ele.width() - $content.width()
			}
		}

		//rule 3: min - max left
		left = Math.min(left, jQuery(window).scrollLeft() + screenSize.width - $content.width() - 4);
		left = Math.max(jQuery(window).scrollLeft() + 4, left);

		//rule 4: min top
		top = Math.max(0, top);

		//rule 5: arrow pos
		var arrowLeft = offset.left - left + 14;

		var $arrow = $box.find('.__Arrow');
		$arrow.removeClass('_bottom _top')
					.addClass('_' + placement)
					.css('left', arrowLeft);

		$box.css('left', left)
				.css('top', top)
		$box.css('visibility', 'visible');

	},
	showBox: function($ele, type){
		var offset = $ele.offset();
		var $box = HE.box.findOrNewBox();
		//reset min-width, min-height in case auto size set it
		$box.find('.he-Box.__View').css('min-height', '').css('min-width', '')

		HE.box.updateBoxPosition($ele, $box);
		jQuery($box).show()
		jQuery($box).data('heibUrl', $ele[0].href)
								.data('heibType', type)
								.data('heibTarget', $ele)
								.trigger('heibUpdateBoxContent')
	},
	hideBox: function(){
		var $box = jQuery('#heib_box_wrapper');
		HE.utils.setDelayState('mouseLeaveBox', function(){
			$box.hide();
		}, 1000);
	},
	cancelHideBox: function(){
		HE.utils.clearDelayState('mouseLeaveBox');
	},
	findOrNewBox: function(){
		var HEIBBox = require('../components/HEIBBox.jsx');
		var React = require('react');
		var $box = jQuery('#heib_box_wrapper');
		if(!$box.length) {
			$box = jQuery('<div id="heib_box_wrapper"><div id="heib_box_content"></div></div>');
			jQuery('body').append($box);
			React.render(React.createElement(HEIBBox), document.getElementById('heib_box_content'));
			//bind box events
			$box.on('mouseenter', function(){
				HE.box.cancelHideBox();
			})
			.on('mouseleave', function(){
				HE.box.hideBox();
			})
		}
		return $box;
	}
}
////////////////////////////////// Box ///////////////////////////////////////

////////////////////////////////// url ///////////////////////////////////////
HE.url = {
	getBoxPermalinks: function(cb){
		HE.storage.get('box.permalinks', {}, function(res){
			cb(res)
		})
	},
	bindUrl: function(){
		HE.url.getBoxPermalinks(function(permalinks){
			//prepare blacklist
			var blacklist = [];
			if(permalinks.config && permalinks.config.blacklist){
				var blacklistStr = permalinks.config.blacklist.replace(/\n/g, ';')
				var blacklist = blacklistStr.split(';').map(function(val){
					return val.trim();
				}).filter(function(val){
					return val.length > 0;
				})
			}
			if(Object.keys(permalinks).length <= 1) {
				//no box permalinks found, just skip it
				return;
			}

			if(jQuery(this).data('heibType') === undefined){
				jQuery('a').each(function(){
					var href = this.href;
					var $this = jQuery(this);
					if(href.indexOf(permalinks.config.home) === 0  && (blacklist.length === 0 || !HE.url.matchUrl(href, blacklist))) {
						for(var type in permalinks){
							//check for blacklist
							if(type !== 'config' && HE.url.matchUrl(href, permalinks[type])){
								HE.storage.get('verifyLink', {contextUrl: href, type: type}, function(res){
									if(res){
										$this.data('heibType', type);
									}
								});
								return;
							}
						}
					}
				})				
			}

		})

		jQuery('a', document).on('mouseenter', function(){
			var $this = jQuery(this);
			var boxType = $this.data('heibType');
			if(boxType !== undefined){
				HE.box.cancelHideBox();
				HE.box.showBox($this, boxType);
			}
		})
		.on('mouseleave', function(){
			var $this = jQuery(this);
			var boxType = $this.data('heibType');
			if(boxType !== undefined){
				HE.box.hideBox($this, boxType);
			}			
		});
	},
	matchUrl: function(url, pattern){
		//pattern as array
		if(Array.isArray(pattern)){
			for(var i = 0; i < pattern.length; i++){
				if(HE.url.matchUrl(url, pattern[i])){
					return true;
				}
			}
			return false;
		}

		var tagRegs = {
			'%year%': 				'[0-2][0-9]{3}',
			'%monthnum%': 		'[0-1][0-9]',
			'%day%': 					'[0-3][0-9]',
			'%hour%': 				'[0-2][0-9]',
			'%minute%': 			'[0-6][0-9]',
			'%second%': 			'[0-6][0-9]',
			'%post_id%': 			'\d+',
			'%postname%': 		'[^/]+',
			'%category%': 		'[^/]+',
			'%author%': 			'[^/]+',
		}
		for(var key in tagRegs){
			pattern = pattern.replace(key, tagRegs[key]);
		}
		var re = new RegExp(pattern, 'i');
		var result = url.match(re);

		if(result !== null) {
			return true;
		} else {
			return false;
		}
	}
}
////////////////////////////////// url ///////////////////////////////////////

HE.form = {
	textarea: {
		autosize: function($scope){
			function updateSize($textarea){
	      if($textarea[0].clientHeight < $textarea[0].scrollHeight){
	        $textarea.height($textarea[0].scrollHeight + 20)
	      }
			}
		
	    jQuery($scope).find('textarea').each(function(){
	    	var $this = jQuery(this)
	    	updateSize($this)
	    	
	    	//attach editor button if not exists
	    	if(!$this.parent().find('.he-editor-btn').length){
	    		var showBtn = jQuery('<button class="button he-editor-btn">Editor</button>')
	    		showBtn.on('click', function(){
			    	jQuery('textarea').removeClass('he-activeEditor')
			    	$this.addClass('he-activeEditor');
	    			HE.form.textarea.showEditor()
	    		})
		    	$this.before(showBtn)
	    	}
	    })	    
	    .on('keypress', function(){
	    	updateSize(jQuery(this))
	    })

		},
		showEditor: function(){
			var $editor = jQuery('#wp-heib-editor-wrap');
			var $designer = jQuery('#he-design-holder');
			var $textarea = jQuery('textarea.he-activeEditor')
			$editor.toggle(400);
			$designer.toggle();
			//attach Done button
    	if(!$editor.find('.he-hideEditor-btn').length){
    		var hideBtn = jQuery('<button class="button button-primary he-hideEditor-btn">Done</button>')
    		hideBtn.on('click', function(){
    			 HE.form.textarea.hideEditor()
    		})
	    	$editor.append(hideBtn)
    	}
    	if($textarea.length){
	    	//set content
	    	tinyMCE.activeEditor.setContent($textarea.val());    		
    	}
    	$textarea.attr("disabled","disabled")
			jQuery('.he-editor-btn').attr("disabled", "disabled")
		},
		hideEditor: function(){
			var $editor = jQuery('#wp-heib-editor-wrap')
			var $designer = jQuery('#he-design-holder')
			var $textarea = jQuery('textarea.he-activeEditor')
			$editor.toggle()
			$designer.toggle(400)
			if($textarea.length){
				$textarea.val(tinyMCE.activeEditor.getContent())
				// $textarea.trigger('change');
				React.addons.TestUtils.Simulate.change($textarea[0])
				$textarea.removeAttr("disabled")
				jQuery('.he-editor-btn').removeAttr("disabled")
			}
		}
	}
}
////////////////////////////////// Cache ///////////////////////////////////////
HE.cache = {
	store: HE.lab.init({}),
	remember: function(key, lifeTime, valFn){
		var val = HE.cache.store.get(key, undefined);
		if(val === undefined){
			//data expired or not set, call valFn to update cache data
			if(typeof valFn === 'function'){
				val = valFn();
			} else {
				val = valFn;
			}
			HE.cache.set(key, val, lifeTime);
		}
		return HE.cache.get(key);
	},
	rememberForever: function(key, valFn){
		return HE.cache.remember(key, null, valFn);
	},
	get: function(key, def){
		var expiredAt = HE.cache.store.get(key + '.____expiredAt', null);
		if(expiredAt !== -1 && (expiredAt === null || parseInt(expiredAt) < Date.now())){
			//data expired, call valFn to update cache data
			return def;
		}
		return HE.cache.store.get(key + '.____value', def)
	},
	set: function(key, val, lifeTime){
		var expiredAt = lifeTime?Date.now() + parseInt(lifeTime):-1;
		HE.cache.store.set(key, {____expiredAt:expiredAt,____value:val})
	},
	forget: function(key){
		HE.cache.store.clear(key);
	}
}
////////////////////////////////// Cache ///////////////////////////////////////

////////////////////////////////// Stack ///////////////////////////////////////
HE.stack = {
	maxStackBuffer: 100,
	Stack: function(stackName){
		this.stackName = stackName;
		this.data = [];
		this.pointer = -1;
		this.savedPointer = null;
		this.resetDataToCurrentPointer = function(){
			if(this.data.length <= (this.pointer + 1)){

			} else {
				this.data.splice(this.pointer + 1)
			}
			return this;
		}
		this.push = function(val){
			this.resetDataToCurrentPointer();
			this.data.push(val)
			this.pointer = this.data.length - 1;
			//check max buffer stack
			if(this.pointer >= HE.stack.maxStackBuffer) {
				this.data.shift();
				this.pointer --;
			}
			return this;
		}
		this.current = function(){
			return this.data[this.pointer];
		}
		this.pop = function(){
			this.resetDataToCurrentPointer();
			var data = this.data.pop();
			this.pointer --;
			//check min pointer value
			this.pointer = this.pointer >= -1? this.pointer : -1;
			return data;
		}
		this.hasPrev = function(){
			return (this.pointer > 0)?true : false;
		}
		this.backward = function(){
			this.pointer --;
			this.pointer = this.pointer >= -1? this.pointer : -1;
			return this;
		}
		this.hasNext = function(){
			return (this.pointer < this.data.length - 1)?true : false;
		}
		this.forward = function(){
			this.pointer ++;
			this.pointer = (this.pointer >= this.data.length)? this.data.length - 1 : this.pointer;
			return this;
		}
		this.reset = function(){
			this.data = [];
			this.pointer = -1;
		}
		this.savePointer = function(){
			this.savedPointer = this.pointer;
			return this;
		}
		this.canSave = function(){
			return (this.savedPointer === null && this.pointer > 0 ) || (this.savedPointer !== null && this.savedPointer != this.pointer);
		}
		return this;
	},
	getInstance: function(stackName){
		return HE.cache.rememberForever('____stack.' + stackName, function(){
			return new HE.stack.Stack(stackName);
		})
	}
}
////////////////////////////////// Stack ///////////////////////////////////////

HE.boxStack = {
	pushState: function(){
		HE.stack.getInstance('editingBoxDataStack').push(jQuery.extend(true, {}, HE.boxStack.currentState()));
		HE.hook.do_action('changedHEState__editedBox')
	},
	hasNextState: function(){
		return HE.stack.getInstance('editingBoxDataStack').hasNext();
	},
	nextState: function(){
		return HE.stack.getInstance('editingBoxDataStack').forward().current();
	},
	hasPrevState: function(){
		return HE.stack.getInstance('editingBoxDataStack').hasPrev();
	},
	prevState: function(){
		return HE.stack.getInstance('editingBoxDataStack').backward().current();
	},
	reset: function(){
		return HE.stack.getInstance('editingBoxDataStack').reset();
	},
	saveState: function(){
		return HE.stack.getInstance('editingBoxDataStack').savePointer();
	},
	isChanged: function(){
		return HE.stack.getInstance('editingBoxDataStack').canSave();
	},
	currentState: function(){
		var editingBox = HE.HEState.getState('editingBox', null);
		var currentState;
		var lab = HE.boxStack.getCurrentBoxLab();
		if(lab !== null){
			currentState = lab.getVal();
		}
		return currentState;
	},
	getCurrentBoxLab: function(){
		var editingBox = HE.HEState.getState('editingBox', null);
		if(editingBox !== null){
			return window.HEStore.link('boxes.' + editingBox)
		}
		return null;
	}
}
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
		var $fnArgs = Array.prototype.slice.call(arguments, 1);
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
					$fnArgs[0] = $value;
					$value = fn.apply(undefined, $fnArgs);
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
		var $fnArgs = Array.prototype.slice.call(arguments, 1)
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

////////////////////////////////// Storage /////////////////////////////////////
HE.storage = {
	storageType: null,
	defaultStorageType: 'local',
	handlers: {},
	get: function(endpoint, params, passCb, failCb, storageType){
		handler = HE.storage.getHandler(storageType);
		return handler.getData(endpoint, params, passCb, failCb);
	},
	set: function(endpoint, val, params, passCb, failCb, storageType){
		handler = HE.storage.getHandler(storageType);
		return handler.setData(endpoint, val, params, passCb, failCb);
	},
	setStorageType: function(storageType){
		HE.storage.storageType = storageType;
	},
	getHandler: function(storageType){
		storageType = storageType || HE.storage.storageType || HE.storage.defaultStorageType
		if(!HE.storage.handlers[storageType]){
			HE.hook.do_action('getStorage__' + storageType);
		}
		return HE.storage.handlers[storageType];
	},
	setHandler: function(storageType, handler){
		HE.storage.handlers[storageType] = handler;
	}
}

var localStorageHandler = function(){
	this.getData = function(endpoint, params, passCb, failCb){
		var data = localStorage.getItem(endpoint);
		if(typeof passCb === 'function') {
			passCb(jQuery.parseJSON(data));
		}
	}
	this.setData = function(endpoint, val, params, passCb, failCb){
		var data = localStorage.setItem(endpoint, JSON.stringify(val));
		if(typeof passCb === 'function') {
			passCb(data);
		}
	}
	return this;
}

var ajaxStorageHandler = function(){
	this.getData = function(endpoint, params, passCb, failCb){
		params = jQuery.extend(true, {}, params, {endpoint:endpoint + '.get'});
		//apply batch
		HE.utils.getBatch('heibAjaxStorage', HE.utils.ajaxBatchHandler, 100, 20)(params, function(res){
			if(typeof passCb === 'function') {
				passCb(res.data);
			}			
		}, failCb);
	}
	this.setData = function(endpoint, val, params, passCb, failCb){
		HE.utils.ajax(jQuery.extend(true, {}, params, {endpoint:endpoint + '.set', value: val}), function(res){
			if(typeof passCb === 'function') {
				passCb(res.data);
			}
		}, failCb);
	}
	return this;
}

//action hook to return local storage
HE.hook.add_action('getStorage__local', function(){
	handler = new localStorageHandler();
	HE.storage.setHandler('local', handler);
})
//action hook to return ajax storage
HE.hook.add_action('getStorage__ajax', function(){
	handler = new ajaxStorageHandler();
	HE.storage.setHandler('ajax', handler);
})
////////////////////////////////// Storage /////////////////////////////////////

//////////////////////////////// HEState //////////////////////////////////
HE.HEState = {
	states: {},
	setState: function(stateName, val){
		HE.HEState.states[stateName] = HE.hook.apply_filters('setHEState__' + stateName, val);
		HE.hook.do_action('changedHEState__' + stateName, val);
	},
	getState: function(stateName, def){
		var val = HE.HEState.states[stateName];
		val = (val === undefined)?def: val;
		return HE.hook.apply_filters('getHEState__' + stateName, val);
	},
	clearState: function(stateName){
		var val = HE.HEState.states[stateName];
		delete HE.HEState.states[stateName];
		HE.hook.do_action('changedHEState__' + stateName, val);
	}
}

//////////////////////////////// HEState //////////////////////////////////

	window.HE = HE;
} else {
	var HE = window.HE;
}

module.exports = HE;
