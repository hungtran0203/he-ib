var inputMixins = {
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