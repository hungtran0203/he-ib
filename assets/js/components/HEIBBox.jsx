var React = require('react');

var HE = require('../lib/he.js');

jQuery(document).on('he_inited', function(){
	//load required mixins
	HE.UI.setMixins('lab', require('../mixins/lab.js'))
	HE.UI.setMixins('common', require('../mixins/common.js'))
	HE.UI.setMixins('responsive', require('../mixins/responsive.js'))
	HE.UI.setMixins('blockContent', require('../mixins/blockContent.js'))

	//load required components
	HE.UI.setComponent('Block', require('../components/BlockView.jsx'))

	//load default hooks
	require('../lib/hook.js');

});

//init Halo Engine
HE.init();

var HEIBBox = React.createClass({
	mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive],
	getInitialState: function() {
		this.loadIBLab();
		// this.store = window.HEStore;
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
				self.forceUpdate();
			}
		})

		window.HEState = HE.lab.init({});

		//assign labs
		this.store = window.HEStore;
		this.lab = window.HEStore;
		this.HEState = window.HEState;
  },
  componentDidMount: function(){
  	var self = this;
  	var $box = jQuery('#heib_box_wrapper');
  	$box.on('heibUpdateBoxContent', HE.utils.getLock('heibUpdateBoxContent', function(){
  		var boxType = $box.data('heibType')
  		var boxUrl = $box.data('heibUrl')
  		//set current context
  		HE.cache.set('heCurrentContextId', HE.utils.hashCode(boxUrl));
  		HE.cache.set('heCurrentContextUrl', boxUrl);

  		if(boxType !== undefined && boxUrl !== undefined){
  			self.boxType = boxType;
  			self.boxUrl = boxUrl;
  			self.forceUpdate();
  			//update box position reflect its dimension
  			var boxTarget = $box.data('heibTarget')
  			if(boxTarget){
  				HE.box.updateBoxPosition(boxTarget, jQuery(this));	
  			}
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