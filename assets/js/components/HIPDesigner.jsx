var React = require('react');

var Draggable = require('react-draggable');

var jQuery = require('jquery')
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
			return {'redraw': true};
	  },
	  loadIBLab: function(){
			var storeDataStr = localStorage.getItem('box', null);
			if(storeDataStr){
				window.store = HE.lab.init(jQuery.parseJSON(storeDataStr));
			} else {
				window.store = HE.lab.init({box:{type:'box', 
																	name:'my box', 
																	title: 'my box', 
																	style:{width:'300px', height:'300px'}, 
																	blocks:[]
																}
														});
			}

			var configBlockData = {containerBlocks: [],
															contentBlocks: []
														};

			configBlockData = HE.hook.apply_filters('get_config_block_data', configBlockData)
			window.configBlocks = HE.lab.init(configBlockData);

			window.HEState = HE.lab.init({});
	  },
		handleOnSave: function(event){
			localStorage.setItem('box', JSON.stringify(window.store.getVal()));
		},
		handleOnClear: function(event){
			localStorage.removeItem('box');
			this.loadIBLab();
			this.refs.config.setLab(window.configBlocks)
			this.refs.edit.setLab(window.store.link('box'))
			this.forceUpdate();
		},
    render: function () {
        return (
        	<div className="">
        		<HE.UI.components.Grid.Rows>
	        		<div data-width="20">
	        			<div>Title</div>
	        			<div>Toolbar</div>
	        			<HE.UI.components.Block.ConfigList data-lab={window.configBlocks} ref="config">
	        			</HE.UI.components.Block.ConfigList>
	        		</div>
	        		<div data-width="50" >
	        			<div>Title</div>
	        			<div className="he-ib-design-toolbar">
	        				<button onClick={this.handleOnSave}>Save</button>
	        				<button onClick={this.handleOnClear}>Clear</button>
	        			</div>
	        			<div className="he-DesignViewPort">
	        				<div className="he-DesignCanvas">
	        					<HE.UI.components.Block.Box.Edit data-lab={window.store.link('box')} ref="edit">
	        					</HE.UI.components.Block.Box.Edit>
	        				</div>
	        			</div>
	        			<div>Footer</div>
	        		</div>
	        		<div data-width="30">
	        			<div>Title</div>
	        			<div>Toolbar</div>
      					<HE.UI.components.Block.Attributes style={{padding:'5px 5px'}} data-lab={window.HEState.link('activeBlock')} ref="attributes">
      					</HE.UI.components.Block.Attributes>
	        		</div>        			
        		</HE.UI.components.Grid.Rows>
          </div>
        );
    }
});

React.render(<App/>, document.body);