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
		  componentWillReceiveProps: function(nextProps){
		  	//update lab if changed
		  	var lab = this.getLab();
		  	var newLab = nextProps['data-lab'];
		  	if(newLab && HE.utils.isLab(newLab)) {
		  		if(lab) {
		  			if(lab.getFullNS() !== newLab.getFullNS()) {
		  				this.setLab(newLab);	
		  			}
		  		} else {
		  			this.setLab(newLab);
		  		}
		  	}
		  },
		  getLab: function(){
		  	if(this.lab){
		  		//check if lab has been changed
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
							HE.cache.set('changingLabSource', 1, 1000);
			        ui.setState({'data-lab': lab});
		      	}
		      });
		      this.labBinders['clear'] = lab.bind('*', 'clear', function(){
		      	if(ui.isMounted()){
							HE.cache.set('changingLabSource', 1, 1000);
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
