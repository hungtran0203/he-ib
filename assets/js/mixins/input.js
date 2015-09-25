var inputMixins = {
  componentDidMount: function () {
  	if(this.refs.input){
	    var self = this;
	    //bind filterChange if set
	    if(this.props.filterChange){
		    var thisInput = React.findDOMNode(this.refs.input);
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