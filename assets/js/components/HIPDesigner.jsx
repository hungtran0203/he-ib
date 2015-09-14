var React = require('react');

var Draggable = require('react-draggable');

var HE = require('../lib/he.js');

HE.init();

HE.hook.add_filter('get_config_block_data', function(configBlockData){
	//load absolute container
	configBlockData.containerBlocks.push({type:'container.absolute', name:'container_absolute', title:'Absolute Container'})
	//load vertical container
	configBlockData.containerBlocks.push({type:'container.vertical', name:'container_vertical', title:'Vertical Container'})

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
	HE.hook.add_action('fetchBlockContent__html', function(block){
		var content = block.getLab().quite().get('options.html.value');
		block.setContent(sanitizeHtmlContent(content));
		return block;
	})
	function sanitizeHtmlContent(content){
		if(content == ''){
			//empty content, just give hint text
			content = '<span class="_Hint"><a href="javascript:void(0)" onclick="HE.utils.focusInput(\'option.html\');">Edit Content</a></span>'
		}
		return content;
	}
	//add action on update html block attributes
	HE.hook.add_action('updateBlockAttribute__html', function(block){
		var content = block.getLab().quite().get('options.html.value');
		block.setContent(sanitizeHtmlContent(content));
		//force to update Lab content
		block.getLab().refresh()
		return block;
	})


	//load image content block
	configBlockData.contentBlocks.push({	type:'content', name:'image', title:'Image', contentFilter: 'image',
																				options: {
																					'image': {
																						componentName:'HE.UI.components.Form.TextArea',
																						value:'',
																						title:'Image URL',
																						name:'image'
																					}
																				}
																			}
																		);
	return configBlockData;
})
var App = React.createClass({
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


			return {'redraw': true};
	  },
	  componentDidMount: function(){
	  	if(this.getLab().get('boxes',[]).length){
		  	HE.HEState.setState('selectedBox', 0)
	  	}
	  },
	  loadIBLab: function(){
			var storeDataStr = localStorage.getItem('heStore', null);
			if(storeDataStr){
				window.store = HE.lab.init(jQuery.parseJSON(storeDataStr));
			} else {
				window.store = HE.lab.init({boxes: []});
			}

			var configBlockData = {containerBlocks: [],
															contentBlocks: []
														};

			configBlockData = HE.hook.apply_filters('get_config_block_data', configBlockData)
			window.configBlocks = HE.lab.init(configBlockData);

			window.HEState = HE.lab.init({});

			//assign labs
			this.store = window.store;
			this.lab = window.store;
			this.HEState = window.HEState;
			this.configBlocks = window.configBlocks;
	  },
		handleSaveButtonClick: function(event){
			localStorage.setItem('heStore', JSON.stringify(this.store.getVal()));
		},
		handleClearButtonClick: function(event){
			localStorage.removeItem('heStore');
			this.loadIBLab();
			this.refs.config.setLab(this.configBlocks)
			this.refs.edit.setLab(this.store.link('heStore'))
			this.forceUpdate();
		},
		handleDoneButtonClick: function(event){
			HE.HEState.clearState('editingBox');
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
		getLeftColumn:function(){
    	if(this.getEditingBox() === null) {
	    	return <HE.UI.components.Block.BoxList data-lab={this.store.link('boxes')} ref="config"></HE.UI.components.Block.BoxList>  
    	} else {
    		return  <HE.UI.components.Block.ConfigList data-lab={this.configBlocks} ref="config"></HE.UI.components.Block.ConfigList>
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
		  			<div className="he-ib-design-toolbar">
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
		  			<div className="he-ib-design-toolbar">
		  				<button onClick={this.handleSaveButtonClick}>Save</button>
		  				<button onClick={this.handleClearButtonClick}>Clear</button>
		  				<button onClick={this.handleDoneButtonClick}>Done</button>
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

React.render(<App/>, document.body);