var React = require('react');

var HEIBBox = React.createClass({
	mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive],
	getInitialState: function() {
		this.store = window.store;
  },
  componentDidMount: function(){
  	var self = this;
  	var $box = jQuery('#heib_box_wrapper');
  	$box.on('heibUpdateBoxContent', HE.utils.getLock('heibUpdateBoxContent', function(){
  		var boxType = $box.data('heibType')
  		var boxUrl = $box.data('heibUrl')
  		if(boxType !== undefined && boxUrl !== undefined){
  			self.boxType = boxType;
  			self.boxUrl = boxUrl;
  			self.forceUpdate();
  		}
  	}, 50));
  },
	getBoxLab: function(boxType){
		var boxes = this.store.get('boxes');
		var index
		for(var key = 0; key < boxes.length; key ++){
			if(boxes[key].name == boxType && (boxes[key].published === undefined || boxes[key].published === 1)){
				index = key;
			}			
		}
		if(index === undefined){
			return null;
		} else {
			return this.store.link('boxes.' + index);
		}
	},
	render: function(){
		var boxLab = this.getBoxLab(this.boxType);
		if(boxLab === null){
			//no box lab found
			return null;
		} else {
			return <HE.UI.components.Block.Box.View data-lab={boxLab} ref="view"></HE.UI.components.Block.Box.View>
		}
	}
})

module.exports = HEIBBox;