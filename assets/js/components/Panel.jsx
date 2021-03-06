var React = require('react');

///////////////////////////////////// Panel /////////////////////////////////////////
HEUI = React.createClass({
	mixins: [HE.UI.mixins.common],
	componentDidMount: function(){
	},
	getBodyClass: function(){
		var bodyClass = "__Body";
		if(this.props['data-collapsed']){
			bodyClass += ' he-hidden';
		}
		return bodyClass;
	},
	handleHeadClick: function(event){
		var $this = jQuery(React.findDOMNode(this))
		//binding
		if($this.hasClass('_pointer')){
			$this.find('.__Body').toggleClass('he-hidden')
		}
	},
  render: function(){
  	var headNode, bodyNode;
  	if(this.props.children.length > 1){
	  	headNode = this.props.children[0]
	  	bodyNode = this.props.children[1]
  	} else {
	  	bodyNode = this.props.children[0]
  	}
    return  <div className={this.getClass('he-Panel')}>
    					{
    						headNode?
	              <div className="__Head" ref="head" onClick={this.handleHeadClick}>
	                {headNode}
	              </div>
	              :null
            	}
            	{
              <div className={this.getBodyClass()} ref="body">
              	{bodyNode}
              </div>
            	}
            </div>
  }
})
///////////////////////////////////// Panel /////////////////////////////////////////

module.exports = HEUI;
