var labMixins = {
		  getInitialState: function() {
		  	if(!this.labBinders) this.labBinders = [];
		    if(this.props['data-lab']){
		    	this.setLab(this.props['data-lab']);
		      return {'data-lab': true};
		    } else {
		      return {};
		    }
		  },
		  getLab: function(){
		  	if(this.lab){
		  		return this.lab;
		  	} else {
		  		return null;
		  	}
		  },
		  setLab: function(lab){
		  	this.clearLab();
		    if(lab && HE.utils.isLab(lab)){
			  	if(!this.labBinders) this.labBinders = [];
		      var ui = this;
		      this.labBinders['set'] = lab.bind('*', 'set', function(){
		      	if(ui.isMounted()){
			        ui.setState({'data-lab': lab});
		      	}
		      });
		      this.labBinders['clear'] = lab.bind('*', 'clear', function(){
		      	if(ui.isMounted()){
			        ui.setState({'data-lab': lab});
			       }
		      });
		      this.lab = lab;
		      if(this.isMounted()){
			      this.setState({'data-lab': lab});
		      }
		    }
		  },
		  clearLab: function(){
		    if(this.lab && this.labBinders && this.labBinders['set'] && this.labBinders['clear']){
			  	this.lab.unbind(this.labBinders['set']);
			  	this.lab.unbind(this.labBinders['clear']);
			  }
		  },
		  componentWillUnmount: function(){
		  	this.clearLab();
		  }
  	}
module.exports = labMixins;
