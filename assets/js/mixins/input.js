var inputMixins = {
  componentDidMount: function () {
  	if(this.refs.iput){
	    var thisInput = React.findDOMNode(this.refs.iput);
	    var self = this;
	    //bind filterChange if set
	    if(this.props.filterChange){
	    	jQuery(thisInput).on('change', function(){
	    		HE.hook.apply_filter('change_input_' + this.props.filterChange, self)
	    	})
	    }
  	}
  },
	getValueLink: function(){
    var ui = this;
    var valueLink = {
      value: ui.getValue(),
      requestChange: function(newVal){ui.setValue(newVal);}
    };
    return valueLink;
	}
}

module.exports = inputMixins;