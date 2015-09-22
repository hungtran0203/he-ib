var React = require('react');

var Draggable = require('react-draggable');

var HE = require('../lib/he.js');

HE.init();

///////////////////////////////////////// begin define hooks ///////////////////////////////////////////

/* default blocks */
HE.hook.add_filter('getListConfigBlocks', function(configBlockData){
	//load absolute container
	configBlockData.containerBlocks.push({type:'container.absolute', name:'container_absolute', title:'Absolute Container'})
	//load vertical container
	configBlockData.containerBlocks.push({type:'container.vertical', name:'container_vertical', title:'Vertical Container'})
	//load horizontal container
	configBlockData.containerBlocks.push({type:'container.horizontal', name:'container_horizontal', title:'Horizontal Container'})

	//setup html block
	configBlockData.contentBlocks.push({	type:'content', name:'html', title:'Html', contentAction: 'html',
																				options: {
																					'html': {
																						componentName:'HE.UI.components.Form.TextArea',
																						value:'',
																						title:'Html',
																						name:'option.html',
																					}
																				}
																			}
																		);
	//add action to display html block content
	HE.hook.add_filter('fetchBlockContent__html', function(content, block){
		content = block.getLab().quite().get('options.html.value');
		content = sanitizeHtmlContent(content);
		return content;
	})
	function sanitizeHtmlContent(content){
		if(content == ''){
			//empty content, just give hint text
			content = '<span class="_Hint"><a href="javascript:void(0)" onclick="HE.utils.focusInput(\'option.html\');">Edit Content</a></span>'
		}
		return content;
	}
	//add action on update html block attributes
	HE.hook.add_action('updateBlockAttribute__html', function(attrBlock){
		attrBlock.getLab().clear('____cachedContentKey');	//clear key to force update content
	})


	//setup shortcode block
	configBlockData.contentBlocks.push({	type:'content', name:'shortcode', title:'Shortcode', contentAction: 'shortcode',
																				options: {
																					'shortcode': {
																						componentName:'HE.UI.components.Form.Shortcode',
																						value:'',
																						title:'Shortcode',
																					}
																				}
																			}
																		);
	//add action to display html block content
	HE.hook.add_filter('fetchBlockContent__shortcode', function(content, block){
		var shortcode = block.getLab().quite().get('options.shortcode.value');
		HE.storage.get('shortcode', {shortcode:shortcode}, function(res){
			var content = sanitizeShortcodeContent(res);
			block.setContent(content);
		})
		return 'Loading ...';
	})
	function sanitizeShortcodeContent(content){
		if(content == ''){
			//empty content, just give hint text
			content = '<span class="_Hint"><a href="javascript:void(0)" onclick="HE.utils.focusInput(\'option.html\');">Edit Content</a></span>'
		}
		return content;
	}
	//add action on update html block attributes
	HE.hook.add_action('updateBlockAttribute__shortcode', function(attrBlock){
		attrBlock.getLab().clear('____cachedContentKey');	//clear key to force update content
	})


	return configBlockData;
})

/* user blocks */
HE.hook.add_filter('getListConfigBlocks__user', function(configBlockData){
	return configBlockData;
})

/* post blocks */
HE.hook.add_filter('getListConfigBlocks__post', function(configBlockData){
	return configBlockData;
})

/* category blocks */
HE.hook.add_filter('getListConfigBlocks__category', function(configBlockData){
	return configBlockData;
})

///////////////////////////////////////// end define hooks ///////////////////////////////////////////
var HEIBApp = React.createClass({
		mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive],
		getInitialState: function() {
			this.loadIBLab();
			//bind actions
			var self = this;

			HE.hook.add_action('setEditingBox', function(editingBox){
				self.store.set('status.editingBox', editingBox);
				//redraw
				self.setState({redraw:true})
			})

			//on HEState change bindings
			self.bindHEState('editingBox');
			self.bindHEState('selectedBox');
			self.bindHEState('editedBox');


			return {'redraw': true};
	  },
	  componentDidMount: function(){
	  	if(this.getLab().get('boxes',[]).length){
		  	HE.HEState.setState('selectedBox', 0)
	  	}
	  },
	  loadIBLab: function(){
	  	var self = this
			// var storeDataStr = localStorage.getItem('heStore', null);
			var storeDataStr = null;
			window.store = HE.lab.init({boxes: []});
			//get boxes data

			HE.storage.get('boxes', null, function(res){
				if(res && res.boxes){
					window.store.quite().set('boxes', res.boxes);
					HE.HEState.setState('selectedBox', 0)					
				}
			})

			//load box from server
			window.configBlocks = this.getListConfigBlocks();

			window.HEState = HE.lab.init({});

			//assign labs
			this.store = window.store;
			this.lab = window.store;
			this.HEState = window.HEState;
			this.configBlocks = window.configBlocks;
	  },
		handleSaveButtonClick: function(event){
			HE.storage.set('boxes', this.lab.getVal(), null, function(res){})

		},
		handleClearButtonClick: function(event){
			var editingBox = HE.HEState.getState('editingBox', null);
			if(editingBox!== null){
				this.getLab().set('boxes.' + editingBox, jQuery.extend(true, {}, {title: 'New Box'}))
			}
			// localStorage.removeItem('heStore');
			// this.loadIBLab();
			// this.refs.config.setLab(this.configBlocks)
			// this.refs.edit.setLab(this.store.link('heStore'))
			// this.forceUpdate();
		},
		handleUndoButtonClick: function(event){
			var undoState = jQuery.extend(true, {}, HE.boxStack.prevState());
			HE.boxStack.getCurrentBoxLab().quite().setVal(undoState);
			this.forceUpdate();
		},
		handleRedoButtonClick: function(event){
			var redoState = jQuery.extend(true, {}, HE.boxStack.nextState());
			HE.boxStack.getCurrentBoxLab().quite().setVal(redoState);
			this.forceUpdate();
		},
		handleDoneButtonClick: function(event){
			this.handleSaveButtonClick(event);
			HE.HEState.clearState('editingBox');
			HE.boxStack.reset();
			this.forceUpdate();
		},
		handleDiscardButtonClick: function(event){
			var undoState;
			do {
				undoState = HE.boxStack.prevState();	
			} while(HE.boxStack.hasPrevState())
			HE.boxStack.getCurrentBoxLab().quite().setVal(undoState);
			this.forceUpdate();			
		},
		getEditingBox: function(){
			return HE.HEState.getState('editingBox', null);
		},
		getSelectedBox: function(){
			return HE.HEState.getState('selectedBox', null);
		},
		getBoxLab: function(index){
			return this.store.link('boxes.' + index);
		},
		getListConfigBlocks: function(){
			//default hook
			var filterName = 'getListConfigBlocks';
			var configBlocks = {containerBlocks: [],
															contentBlocks: []
													};
			configBlocks = HE.hook.apply_filters(filterName, configBlocks);

			//selected box name hook
			var activeBoxName
			var selectedBox = this.getSelectedBox();
			if(selectedBox !== null){
				activeBoxName = this.store.get('boxes.' + this.getSelectedBox() + '.name')
				if(activeBoxName !== undefined){
					configBlocks = HE.hook.apply_filters(filterName + '__' + activeBoxName, configBlocks);
				}
			}

			//init or update
			if(this.configBlocks){
				this.configBlocks.set('', configBlocks);
			} else {
				this.configBlocks = HE.lab.init(configBlocks);
			}
			return this.configBlocks;
		},
		getLeftColumn:function(){
    	if(this.getEditingBox() === null) {
	    	return <HE.UI.components.Block.BoxList data-lab={this.store.link('boxes')} ref="config"></HE.UI.components.Block.BoxList>  
    	} else {
    		return  <HE.UI.components.Block.ConfigList data-lab={this.getListConfigBlocks()} ref="config"></HE.UI.components.Block.ConfigList>
    	}
		},
		getMiddleColumn: function(){
    	if(this.getEditingBox() === null) {
    		var selectedBox = this.getSelectedBox();
    		var boxView
    		if(selectedBox === null){
    			boxView = null;
    		} else {
	    		var selectedBoxLab = this.getBoxLab(selectedBox);
    			boxView = <HE.UI.components.Block.Box.View data-lab={selectedBoxLab} ref="view"></HE.UI.components.Block.Box.View>
    		}
    		return (
    			<div>
		  			<div className="he-DesignToolBar">
		  				<button onClick={this.handleSaveButtonClick}>Save</button>
		  			</div>
    				<div className="he-DesignViewPort">
		  				<div className="he-DesignCanvas">
	  						{boxView}
		  				</div>
    				</div>
    			</div>
    			);
    	} else {
    		var editingBoxLab = this.getBoxLab(this.getEditingBox());
    		return (
    			<div>
		  			<div className="he-he-DesignToolBar">
		  				<button onClick={this.handleSaveButtonClick}>Save</button>
		  				<button onClick={this.handleClearButtonClick}>Clear</button>
		  				<button onClick={this.handleDoneButtonClick}>Done</button>
		  				<button disabled={!HE.boxStack.hasPrevState()} onClick={this.handleUndoButtonClick}>Undo</button>
	  					<button disabled={!HE.boxStack.hasNextState()} onClick={this.handleRedoButtonClick}>Redo</button>
		  				<button disabled={!HE.boxStack.hasPrevState()} onClick={this.handleDiscardButtonClick}>Discard</button>
		  			</div>
      			<div>Box: {editingBoxLab.get('title')}</div>
		  			<div className="he-DesignViewPort">
		  				<div className="he-DesignCanvas">
		  					<HE.UI.components.Block.Box.Edit data-lab={editingBoxLab} ref="edit">
		  					</HE.UI.components.Block.Box.Edit>
		  				</div>
		  			</div>
		  			<div>Footer</div>
		  		</div>
		  		);
    	}
		},
		getRightColumn: function(){
			var attrLab;
			if(this.getEditingBox() === null){
				attrLab = this.getBoxLab(this.getSelectedBox());
			} else {
				attrLab = this.HEState.link('activeBlock');
			}
			return (<div>
		       			<div>Toolbar</div>
	      					<HE.UI.components.Block.Attributes style={{padding:'5px 5px'}} data-lab={attrLab} ref="attributes">
	      					</HE.UI.components.Block.Attributes>
	     				</div>);
		},
    render: function () {
        return (
        	<div className="">
        		<HE.UI.components.Grid.Rows>
	        		<div data-width="20" className="he-Column">
	        			<div>Left</div>
	        			<div>Toolbar</div>
	        			{this.getLeftColumn()}
	        		</div>
	        		<div data-width="50" className="he-Column">
	        			<div>Middle</div>
	        			{this.getMiddleColumn()}
	        		</div>
	        		<div data-width="30" className="he-Column">
	        			<div>Right</div>
	        			{this.getRightColumn()}
	        		</div>        			
        		</HE.UI.components.Grid.Rows>
          </div>
        );
    }
});

React.render(<HEIBApp/>, document.getElementById('heib_wrapper'));