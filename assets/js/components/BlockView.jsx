var React = require('react');
var _ = require('lodash');
var HEUI = {};

HEUI.Content = HEUI.Content || {}
///////////////////////////////////// Block.Content.View //////////////////////////////
HEUI.Content.View = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive, 
          HE.UI.mixins.blockContent],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    return _.merge(defaultStyle, style, labStyle);
  },
  getDefaultStyle: function(){
    return {width:'auto', height: 'auto', top: '0px', left: '0px'};
  },

  render: function(){
    var self = this;
    //fetch content data if not exist
    return <div className="he-ViewBlock he-ContentBlock" style={this.getStyle()} ref="block">
              {this.getContent()}
          </div>;
  }
})
///////////////////////////////////// Block.Content.View //////////////////////////////

HEUI.Box = HEUI.Box || {}
///////////////////////////////////// Block.Box.View //////////////////////////////
HEUI.Box.View = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive
          ],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    style = _.merge(defaultStyle, style, labStyle);

    return style;
  },
  getDefaultStyle: function(){
    return {width:'100px', height: '100px'};
  },
  render: function(){
    var childBlocks = this.getLab().get('blocks', []);
    var self = this;
    return <div className="he-ViewBlock he-Box __View" style={this.getStyle()} ref="block">
            {
              childBlocks.length?
              childBlocks.map(function(val, key) {
                if(val && val.type !== undefined){
                  var componentName = HE.utils.getComponentByBlockType(val.type, 'View');
                  var childLab = self.getLab().link('blocks.' + key)
                  return React.createElement(componentName, {key: key, "data-lab": childLab})
                } else {
                  return null;
                }
              })
              :null
            }
          </div>;
  }
})
///////////////////////////////////// Block.Box.View //////////////////////////////

HEUI.Container = HEUI.Container || {}
HEUI.Container.Absolute = HEUI.Container.Absolute || {}
///////////////////////////////////// Block.Container.Absolute.View //////////////////////////////
HEUI.Container.Absolute.View = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive
            ],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    return _.merge(defaultStyle, style, labStyle);
  },
  getDefaultStyle: function(){
    return {width:'60px', height: '60px', top: '0px', left: '0px'};
  },
  dropHandler: function(event){

  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;

  },
  render: function(){
    var childBlocks = this.getLab().get('blocks', []);
    var self = this;
    return <div className="he-ViewBlock he-ContainerBlock__Absolute _View" style={this.getStyle()} ref="block">
            {
              childBlocks.length?
              childBlocks.map(function(val, key) {
                if(val && val.type !== undefined){
                  var componentName = HE.utils.getComponentByBlockType(val.type, 'View');
                  var childLab = self.getLab().link('blocks.' + key)
                  return React.createElement(componentName, {key: key, "data-lab": childLab})
                } else {
                  return null;
                }
              })
              :null
            }
          </div>;
  }
})
///////////////////////////////////// Block.Container.Absolute.View //////////////////////////////

HEUI.Container.Sortable = HEUI.Container.Sortable || {};
///////////////////////////////////// Block.Container.Sortable.View //////////////////////////////
HEUI.Container.Sortable.View = React.createClass({
  mixins: [HE.UI.mixins.common],
  render: function(){
    var self = this; 
    var childBlock = React.Children.map(this.props.children,
                      function(child, key) {
                        return React.addons.cloneWithProps(child, {ref: 'sortableContent'});
                      }
                    );
    return <div className={this.getClass('he-SortableBlock')} ref="block">
              <div className="__Content" ref="content" key="content">
              {
                childBlock
              }
              </div>
          </div>;
  }  
})
///////////////////////////////////// Block.Container.Sortable.View //////////////////////////////

HEUI.Container.Vertical = HEUI.Container.Vertical || {}
///////////////////////////////////// Block.Container.Vertical.View //////////////////////////////
HEUI.Container.Vertical.View = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive
            ],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    return _.merge(defaultStyle, style, labStyle);
  },
  getDefaultStyle: function(){
    return {width:'60px', height: '60px', top: '0px', left: '0px'};
  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
  },
  render: function(){
    var childBlocks = this.getLab().get('blocks', []);
    var self = this;
    return <div className="he-ViewBlock he-ContainerBlock__Vertical _View" style={this.getStyle()} ref="block">
            {
              childBlocks.length?
              childBlocks.map(function(val, key) {
                if(val && val.type !== undefined){
                  var componentName = HE.utils.getComponentByBlockType(val.type, 'View');
                  var childLab = self.getLab().link('blocks.' + key)
                  return React.createElement(HEUI.Container.Sortable.View, {key: key, "data-container": self},
                          React.createElement(componentName, {"data-lab": childLab})
                        )
                } else {
                  return null;
                }
              })
              :null
            }
          </div>;
  }
})
///////////////////////////////////// Block.Container.Vertical.View //////////////////////////////

HEUI.Container.Horizontal = HEUI.Container.Horizontal || {}
///////////////////////////////////// Block.Container.Horizontal.View //////////////////////////////
HEUI.Container.Horizontal.View = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive
            ],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    return _.merge(defaultStyle, style, labStyle);
  },
  getDefaultStyle: function(){
    return {width:'60px', height: '60px', top: '0px', left: '0px'};
  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
  },
  render: function(){
    var childBlocks = this.getLab().get('blocks', []);
    var self = this;
    return <div className="he-ViewBlock he-ContainerBlock__Horizontal _View" style={this.getStyle()} ref="block">
            {
              childBlocks.length?
              childBlocks.map(function(val, key) {
                if(val && val.type !== undefined){
                  var componentName = HE.utils.getComponentByBlockType(val.type, 'View');
                  var childLab = self.getLab().link('blocks.' + key)
                  return React.createElement(HEUI.Container.Sortable.View, {key: key, "data-container": self},
                          React.createElement(componentName, {"data-lab": childLab})
                        )
                } else {
                  return null;
                }
              })
              :null
            }
          </div>;
  }
})
///////////////////////////////////// Block.Container.Horizontal.View //////////////////////////////

module.exports = HEUI;