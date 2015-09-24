var responsiveMixins = {
		  getInitialState: function() {
		    var ui = this;
		    window.addEventListener('resize', function(event){
		      if(ui.isMounted){
		        ui.setState({'resizing': true});
		      }
		    })
		  	return {};
		  },
		  getColumnNum: function(){
		  	return this.getResponsiveData('col', 1);
		  },
		  getResponsiveData: function(dataName, def){
		  	var data = this.getData(dataName);
		  	return this.getResponsiveVal(data,def);
		  },
		  getResponsiveVal: function(strData, def){
				var size = parseInt(strData);
		  	if(!isNaN(size)) return size;
		    size = this.detectDisplaySize(data, def);
		    return parseInt(size);
		  },
		  detectDisplayMode: function(){
		    //support 5 modes: xxs, xs, sm, md, lg
		    var mode = 4;
		    var actualWidth = HE.utils.getScreenSize().width;
		    if(actualWidth >= 1200){
		      mode = 4;
		    } else if(actualWidth >= 992) {
		      mode = 3;
		    } else if(actualWidth >= 768) {
		      mode = 2;
		    } else if(actualWidth >= 480) {
		      mode = 1;
		    } else {
		      mode = 0;
		    }
		    return mode;
		  },
		  detectDisplaySize: function(configStr, def) {
		    var size = def?def:1;
		    var mode = this.detectDisplayMode();
		    var modes = ['xxs', 'xs', 'sm', 'md', 'lg'];
		    var curr = 0;
		    if(configStr){
		      configStr = '' + configStr;
		      var config = configStr.split(' ');
		      for(var i = 0; i < config.length; i++){
		        var pair = config[i].split('-');
		        if(pair.length === 2 ) {
		          var check = modes.indexOf(pair[0]);
		          if(check === mode){
		            return pair[1];
		          }
		          if(check > -1 && check <= mode && check > curr){
		            curr = check;
		            size = pair[1];
		          }
		        }        
		      }
		    }
		    return size;
		  }
  	}
module.exports = responsiveMixins;