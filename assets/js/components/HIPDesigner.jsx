var React = require('react');

var Draggable = require('react-draggable');

var HE = require('../lib/he.js');

jQuery(document).on('he_inited', function(){
	//load required mixins
	HE.UI.setMixins('lab', require('../mixins/lab.js'))
	HE.UI.setMixins('common', require('../mixins/common.js'))
	HE.UI.setMixins('input', require('../mixins/input.js'))
	HE.UI.setMixins('user', require('../mixins/user.js'))
	HE.UI.setMixins('responsive', require('../mixins/responsive.js'))
	HE.UI.setMixins('blockContent', require('../mixins/blockContent.js'))

	//load required components
	HE.UI.setComponent('Form', require('../components/Form.jsx'))
	HE.UI.setComponent('Grid', require('../components/Grid.jsx'))
	HE.UI.setComponent('Block', require('../components/Block.jsx'))
	HE.UI.setComponent('Panel', require('../components/Panel.jsx'))

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
		return configBlockData;
	})

	/* user blocks */
	HE.hook.add_filter('getListConfigBlocks__user', function(configBlockData){
		//setup user shortcode block
		configBlockData.contentBlocks.push({	type:'content', name:'shortcode', title:'Shortcode', contentAction: 'shortcode',
																					options: {
																						'shortcode': {
																							componentName:'HE.UI.components.Form.Shortcode',
																							value:'',
																							title:'Shortcode',
																							sType:'user'
																						}
																					}
																				}
																			);
		return configBlockData;
	})

	/* post blocks */
	HE.hook.add_filter('getListConfigBlocks__post', function(configBlockData){
		//setup user shortcode block
		configBlockData.contentBlocks.push({	type:'content', name:'shortcode', title:'Shortcode', contentAction: 'shortcode',
																					options: {
																						'shortcode': {
																							componentName:'HE.UI.components.Form.Shortcode',
																							value:'',
																							title:'Shortcode',
																							sType:'post'
																						}
																					}
																				}
																			);
		return configBlockData;
	})

	/* category blocks */
	HE.hook.add_filter('getListConfigBlocks__category', function(configBlockData){
		return configBlockData;
	})

	//load default hooks
	require('../lib/hook.js');
	///////////////////////////////////////// end define hooks ///////////////////////////////////////////

});

//init Halo Engine
HE.init();

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
			self.bindHEState('editedBox', function(){
				self.updateButtons();
			});


			return {'redraw': true};
	  },
	  componentDidMount: function(){
	  	//move editor to the place holder place
	  	jQuery('#wp-heib-editor-wrap').appendTo(jQuery('#he-editor-holder'))

	  	if(this.getLab().get('boxes',[]).length){
		  	HE.HEState.setState('selectedBox', 0)
	  	}
	  	this.updateButtons();
	  },
	  componentDidUpdate: function(){
	  	this.updateButtons();
	  },
	  loadIBLab: function(){
	  	var self = this
			// var storeDataStr = localStorage.getItem('heStore', null);
			var storeDataStr = null;
			window.HEStore = HE.lab.init({boxes: []});
			//get boxes data

			HE.storage.get('boxes', null, function(res){
				if(res && res.boxes){
					window.HEStore.quite().set('boxes', res.boxes);
					HE.HEState.setState('selectedBox', 0)
				}
			})

			//load box from server
			window.configBlocks = this.getListConfigBlocks();

			window.HEState = HE.lab.init({});

			//assign labs
			this.store = window.HEStore;
			this.lab = window.HEStore;
			this.HEState = window.HEState;
			this.configBlocks = window.configBlocks;

			this.store.bind('*', 'set', function(){
				HE.cache.set('boxesDidChange', 1)
				self.updateButtons();
			})
	  },
	  updateButtons: function(){
	  	if(this.refs['saveBtn']){
	  		var isChanged = HE.cache.get('boxesDidChange', 0);
				this.refs['saveBtn'].props['disabled'] = !isChanged;
				this.refs['saveBtn'].forceUpdate();	  		
	  	}
	  	if(this.refs['undoBtn']){
				this.refs['undoBtn'].props['disabled'] = !HE.boxStack.hasPrevState()
				this.refs['undoBtn'].forceUpdate();	  		
	  	}
	  	if(this.refs['redoBtn']){
				this.refs['redoBtn'].props['disabled'] = !HE.boxStack.hasNextState()
				this.refs['redoBtn'].forceUpdate();	  		
	  	}

	  	if(this.refs['discardBtn']){
				this.refs['discardBtn'].props['disabled'] = !HE.boxStack.hasPrevState()
				this.refs['discardBtn'].forceUpdate();	  		
	  	}

	  },
		handleSaveButtonClick: function(event){
			HE.storage.set('boxes', this.lab.getVal(), null, function(res){})
			HE.boxStack.saveState();
			HE.cache.set('boxesDidChange', 0);
			//update Button
			this.updateButtons();
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
			HE.boxStack.getCurrentBoxLab().setVal(undoState);
			this.updateButtons();
		},
		handleRedoButtonClick: function(event){
			var redoState = jQuery.extend(true, {}, HE.boxStack.nextState());
			HE.boxStack.getCurrentBoxLab().setVal(redoState);
			this.updateButtons();
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
			HE.boxStack.getCurrentBoxLab().setVal(undoState);
			this.updateButtons();
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
	    	return <div>
						    	<h3>Available Boxes</h3>
						    	<HE.UI.components.Block.BoxList data-lab={this.store.link('boxes')} ref="config"></HE.UI.components.Block.BoxList>
						    </div>
    	} else {
    		return  <div>
    							<h3>Available Blocks</h3>
    							<HE.UI.components.Block.ConfigList data-lab={this.getListConfigBlocks()} ref="config"></HE.UI.components.Block.ConfigList>
    						</div>
    	}
		},
		getMiddleColumn: function(){
    	if(this.getEditingBox() === null) {
    		var selectedBox = this.getSelectedBox();
    		var boxView, boxTitle
    		if(selectedBox === null){
    			boxView = null;
    		} else {
	    		var selectedBoxLab = this.getBoxLab(selectedBox);
    			boxView = <HE.UI.components.Block.Box.View data-lab={selectedBoxLab} ref="view"></HE.UI.components.Block.Box.View>
    			boxTitle = selectedBoxLab.get('title')
    		}
    		return (
    			<div>
    				<h3>Box Preview {boxTitle? '[' + selectedBoxLab.get('title') + ']':''}</h3>
    				<div className="mce-container">
			  			<div className="he-DesignToolBar mce-toolbar">
			  				<div className="mce-btn-group">
				  				<div className="__item mce-btn">
				  					<button onClick={this.handleSaveButtonClick} ref="saveBtn">
				  						Save
				  					</button>
				  				</div>
			  				</div>
			  			</div>
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
    			<div className="">
    				<h3>Box Design [{editingBoxLab.get('title')}]</h3>
    				<div className="mce-container">
			  			<div className="he-DesignToolBar mce-toolbar">
			  				<div className="mce-btn-group">
				  				<div className="__item mce-btn">
				  					<button onClick={this.handleSaveButtonClick} ref="saveBtn">
				  						Save
				  					</button>
				  				</div>
				  				<div className="__item mce-btn">
					  				<button onClick={this.handleClearButtonClick} ref="clearBtn">
				  						Clear
				  					</button>
				  				</div>
				  				<div className="__item mce-btn">
					  				<button onClick={this.handleDoneButtonClick} ref="doneBtn">
				  						Done
				  					</button>
				  				</div>
				  				<div className="__item mce-btn">
					  				<button onClick={this.handleUndoButtonClick} ref="undoBtn">
				  						Undo
				  					</button>
				  				</div>
				  				<div className="__item mce-btn">
				  					<button onClick={this.handleRedoButtonClick} ref="redoBtn">
				  						Redo
				  					</button>
				  				</div>
				  				<div className="__item mce-btn">
					  				<button onClick={this.handleDiscardButtonClick} ref="discardBtn">
				  						Discard
				  					</button>
				  				</div>
			  				</div>
			  			</div>
			  		</div>
		  			<div className="he-DesignViewPort">
		  				<div className="he-DesignCanvas">
		  					<HE.UI.components.Block.Box.Edit data-lab={editingBoxLab} ref="edit">
		  					</HE.UI.components.Block.Box.Edit>
		  				</div>
		  			</div>
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
	      					<HE.UI.components.Block.Attributes style={{padding:'5px 5px'}} data-lab={attrLab} ref="attributes">
	      					</HE.UI.components.Block.Attributes>
	     				</div>);
		},
    render: function () {
        return (
        	<div className="wp-core-ui">
        		<HE.UI.components.Grid.Rows>
	        		<div data-width="20" className="he-Column">
	        			{this.getLeftColumn()}
	        		</div>
	        		<div data-width="50" className="he-Column">
	        			<div id="he-design-holder">
	        			{this.getMiddleColumn()}
	        			</div>
	        			<div id="he-editor-holder"></div>
	        		</div>
	        		<div data-width="30" className="he-Column">
	        			<h3>Properties</h3>
	        			{this.getRightColumn()}
	        		</div>        			
        		</HE.UI.components.Grid.Rows>
          </div>
        );
    }
});

if(document.getElementById('heib_wrapper')){
	React.render(<HEIBApp/>, document.getElementById('heib_wrapper'));	
}
