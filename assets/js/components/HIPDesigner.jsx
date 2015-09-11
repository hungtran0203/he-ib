var React = require('react');

var Draggable = require('react-draggable');

var jQuery = require('jquery')
var HE = require('../lib/he.js');

HE.UI.init();


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

			window.configBlocks = HE.lab.init({containerBlocks: [{type:'container.absolute', name:'container_absolute', title:'Absolute Container'},
																													{type:'container.vertical', name:'container_vertical', title:'Vertical Container'},
																													// {type:'container.horizontal', name:'container_horizontal', title:'Horizontal Container'}
																													],
																				contentBlocks: [{	type:'content', 
																													name:'static_html', 
																													title:'Static Html',
																													options: [
																														{
																															componentName:'HE.UI.components.Form.TextArea',
																															value:'',
																															title:'Html',
																															name:'html'
																														}
																													]
																												}
																											]
																			});
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