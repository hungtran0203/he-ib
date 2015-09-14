/** @jsx React.DOM */

var React = require('react');
var HEUI = {};
var interact = require('interact.js')
var jQuery = require('jquery')
var _ = require('lodash');

/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// Mixins ///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
var blockAttributeMixins = {
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
    //on block active
    jQuery(thisElement).on('mousedown', function(event){
      jQuery(document).trigger('blockactivate',[event, self.getLab()]);
      jQuery(thisElement).focus();
      //prevent any futher process
      event.stopPropagation();
    })
  }
}
var resizeableMixins = {
  resizeHandler: function(event){
    var thisBlock = React.findDOMNode(this.refs.block);
    var currentWidth = this.getLab().get('style.width', this.getDefaultStyle().width);
    if(currentWidth == 'auto'){
      currentWidth = jQuery(thisBlock).width() + 'px';
    }
    this.getLab().set('style.width', HE.utils.changeCssAttr(currentWidth , Math.round(event.dt * event.velocityX /1000)));

    var currentHeight = this.getLab().get('style.height', this.getDefaultStyle().height);
    if(currentHeight == 'auto'){
      currentHeight = jQuery(thisBlock).height() + 'px';
    }
    this.getLab().set('style.height', HE.utils.changeCssAttr(currentHeight , Math.round(event.dt * event.velocityY /1000)));
    this.showRulers();
  },
  showRulers: function(event){
    //show the rulers
    var thisBlock = React.findDOMNode(this.refs.block);
    var $thisBlock = jQuery(thisBlock);
    var hRuler = jQuery('.he-Ruler__Horizontal').first();
    if(!hRuler.length) {
      hRuler = jQuery('<div class="he-Ruler__Horizontal"></div>');
      jQuery('body').append(hRuler);
    }
    hRuler.removeClass('he-hidden')
    var thisOffset = $thisBlock.offset();
    var hRulerTop = thisOffset.top - 25
    var hRulerLeft = thisOffset.left
    hRuler.css('top', hRulerTop)
          .css('left', hRulerLeft)
          .css('width', this.getStyle().width)
          .css('height', '20px')
          .css('padding', this.getStyle().padding)
          .html('<span>' + this.getStyle().width + '</span>')

    var vRuler = jQuery('.he-Ruler__Vertical').first();
    if(!vRuler.length) {
      vRuler = jQuery('<div class="he-Ruler__Vertical"></div>');
      jQuery('body').append(vRuler);
    }
    vRuler.removeClass('he-hidden')
    var vRulerTop = thisOffset.top
    var vRulerLeft = thisOffset.left - 25
    vRuler.css('top', vRulerTop)
          .css('left', vRulerLeft)
          .css('width', '20px')
          .css('height', this.getStyle().height)
          .css('padding', this.getStyle().padding)
          .html('<span>' + this.getStyle().height + '</span>')
  },
  hideRules: function(event){
    var thisBlock = React.findDOMNode(this.refs.block);
    var $thisBlock = jQuery(thisBlock);
    var hRuler = jQuery('.he-Ruler__Horizontal').first();
    if(hRuler.length) {
      hRuler.addClass('he-hidden')
    }
    var vRuler = jQuery('.he-Ruler__Vertical').first();
    if(vRuler.length) {
      vRuler.addClass('he-hidden')
    }
  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
    interact(thisElement)
      .resizable({})
      .on('resizemove', this.resizeHandler)
      .on('resizestart', this.showRulers)
      .on('resizeend', this.hideRules)
      ;
  },
}

var draggableMixins = {
  showCoordinate: function(event){
    //show the rulers
    var thisBlock = React.findDOMNode(this.refs.block);
    var $thisBlock = jQuery(thisBlock);
    $thisBlock.addClass('he-dragging')

    if(jQuery(thisBlock).parent().hasClass('he-SortableBlock')){
      return;
    }

    var coordinate = jQuery('.he-BlockCoordinate').first();
    if(!coordinate.length) {
      coordinate = jQuery('<div class="he-BlockCoordinate"></div>');
      jQuery('html').append(coordinate);
    }
    var offset = $thisBlock.offset();
    var style = this.getStyle();
    coordinate.css('top', offset.top -25)
          .css('left', offset.left -25)
          .css('height', '20px')
          .html('<span>' + style.left + ':' + style.top + '</span>')
          .show()
  },
  hideCoordinate: function(event){
    var thisBlock = React.findDOMNode(this.refs.block);
    var $thisBlock = jQuery(thisBlock);
    $thisBlock.removeClass('he-dragging')
    if(jQuery(thisBlock).parent().hasClass('he-SortableBlock')){
      return;
    }
    var coordinate = jQuery('.he-BlockCoordinate').first();
    if(coordinate.length) {
      coordinate.hide();
    }
  },
  getPosition: function(){
    var thisBlock = React.findDOMNode(this.refs.block);
    var currentLeft = this.getLab().get('style.left', this.getDefaultStyle().left);
    if(currentLeft == 'auto'){
      currentLeft = jQuery(thisBlock).position().left + 'px';
    }
    var currentTop = this.getLab().get('style.top', this.getDefaultStyle().top);
    if(currentTop == 'auto'){
      currentTop = jQuery(thisBlock).position().top + 'px';
    }
    return {left:currentLeft, top:currentTop};
  },
  dragHandler: function(event){
    var thisBlock = React.findDOMNode(this.refs.block);
    if(jQuery(thisBlock).parent().hasClass('he-SortableBlock')){
      return;
    }
    var currentPos = this.getPosition()
    var newLeft = HE.utils.changeCssAttr(currentPos.left , Math.round(event.dt * event.velocityX /1000));
    var newTop = HE.utils.changeCssAttr(currentPos.top , Math.round(event.dt * event.velocityY /1000));
    this.getLab().quite().set('style.left', newLeft);

    this.getLab().quite().set('style.top', newTop);
    
    jQuery(thisBlock).css('left', newLeft)
                      .css('top', newTop)
    this.showCoordinate(event);

    //handle control key action
    if(event.ctrlKey){
      this.handleControlKeyHold()
    } else {
      this.handleControlKeyRelease()
    }
  },
  handleControlKeyHold: function(){
    var thisBlock = React.findDOMNode(this.refs.block);
    jQuery('.he-dropActive').addClass('he-parentOnly');
    jQuery(thisBlock).parent().closest('.he-DesignBlock')
            .removeClass('he-parentOnly')
            .addClass('he-dropParent')
    this.useOriginalParent = true;
  },
  handleControlKeyRelease: function(){
    jQuery('.he-parentOnly').removeClass('he-parentOnly he-dropParent');
    jQuery('.he-dropParent').removeClass('he-parentOnly he-dropParent');
    var self = this;
    setTimeout(function(){
      self.useOriginalParent = false;
    }, 10)
  },
  handleDragEnd: function(event){
    this.handleControlKeyRelease();
    this.hideCoordinate(event)
  },
  handleDragStart: function(event){
    this.showCoordinate(event)
    window.he_draggingBlock = this;
  },
  handleDroppedIn: function(container, pos){
    if(!this.useOriginalParent){
      var style = {}
      if(container.getLab().getFullNS('blocks') !== this.getLab().getParentNS()){
        //move to different level, recalculate position
        var $container = jQuery(React.findDOMNode(container.refs.block))
        var $this = jQuery(React.findDOMNode(this))
        var thisOffset = $this.offset();
        var containerOffset = $container.offset();
        style = {
                  style:{
                        left: Math.round(thisOffset.left - containerOffset.left) + 'px', 
                        top: Math.round(thisOffset.top - containerOffset.top) + 'px'
                      }
                }
      }
      var newBlock = jQuery.extend(true, {}, this.getBlockData(), style);
      this.getLab().clear();
      pos = container.getLab().push('blocks', newBlock, pos)      

      //keep this droppedin block as active
      var activeBlock = container.getLab().getFullNS('blocks.' + pos);
      container.getLab().setState('activeBlock', activeBlock);
    }
  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
    interact(thisElement)
      .draggable({})
      .on('dragmove', this.dragHandler)
      .on('dragstart', this.handleDragStart)
      .on('dragend', this.handleDragEnd)
      ;
    //for arrow keys press
    jQuery(thisElement).on('keydown', function(event){
      var currentPos = self.getPosition();
      var arrowKeys = [37, 38, 39, 40]
      switch(event.keyCode){
        case 37:
          self.getLab().set('style.left', HE.utils.changeCssAttr(currentPos.left , -1));
          break;
        case 38:
          self.getLab().set('style.top', HE.utils.changeCssAttr(currentPos.top , -1));
          break;
        case 39:
          self.getLab().set('style.left', HE.utils.changeCssAttr(currentPos.left , 1));
          break;
        case 40:
          self.getLab().set('style.top', HE.utils.changeCssAttr(currentPos.top , 1));
          break;
      }
      if(arrowKeys.indexOf(event.keyCode) >= 0){
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;        
      }
    })
  },
  getBlockData: function(){
    return jQuery.extend(true, {}, this.getLab().getVal());
  }
}

var dropableMixins = {
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
    //dropzone
    var interactOpts = {
      // Require a 75% element overlap for a drop to be possible
      overlap: 1,

      // listen for drop related events:

      ondropactivate: function (event) {
        // add active dropzone feedback
        if(!jQuery.contains(event.relatedTarget, event.target)){
          event.target.classList.add('he-dropActive');
        }
      },
      ondragenter: function (event) {
        var draggableElement = event.relatedTarget,
            dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add('he-dropTarget');
        draggableElement.classList.add('he-canDrop');
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('he-dropTarget');
        event.relatedTarget.classList.remove('he-canDrop');
      },
      ondrop: function (event) {
        window.he_draggingBlock.handleDroppedIn(self)
      },
      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove('he-dropActive');
        event.target.classList.remove('he-dropTarget');
      }
    };
    
    interactOpts = jQuery.extend(true, {}, self.interactOpts, interactOpts);
    interact(thisElement).dropzone(interactOpts);
  },  
}

var blockContentMixins = {
  getContent: function(){
    //init blockContentLab if not exists
    if(!window.he_blockContentLab){
      window.he_blockContentLab = HE.lab.init({}).quite();
    }
    var content = window.he_blockContentLab.get(this.getContentNS());
    self = this;
    if(content === undefined){
      //show loading state
      content = <div className=""></div>
      //fetch the content
      HE.utils.nextTick(function(){
        self.fetchContent();
      })
    } else {
      content = <div dangerouslySetInnerHTML={{'__html':content}}></div>
    }
    return content;
  },
  fetchContent: function(){
    //only fetch new content from server if not exists or expired
    var self = this;
    if(!this.hasContent() || this.isExpiredContent()){
      var filterName = self.getLab().get('contentAction', null)
      if(filterName){
        HE.hook.do_action('fetchBlockContent__' + filterName, self);
      }
    }
  }
}

var configurableMixins = {
  handleDroppedIn: function(container, pos){
    var self = this;
    var $this = jQuery(React.findDOMNode(this));
    //calculate page coordinate
    var $container = jQuery(React.findDOMNode(container.refs.block))
    var thisOffset = $this.offset();
    var containerOffset = $container.offset();

    var newBlock = jQuery.extend(true, {}, self.getBlockData(), {style:{left: Math.round(thisOffset.left - containerOffset.left) + 'px', 
                                                                  top: Math.round(thisOffset.top - containerOffset.top) + 'px'}
                                                                });
    pos = container.getLab().push('blocks', newBlock, pos)
    //keep this droppedin block as active
    var activeBlock = container.getLab().getFullNS('blocks.' + pos);
    container.getLab().setState('activeBlock', activeBlock);
  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
    interact(thisElement)
      .draggable({})
      .on('dragmove', this.dragHandler)
      .on('dragstart', this.handleDragStart)
      .on('dragend', this.handleDragEnd)
      ;
  },
  dragHandler: function(event){
    var thisBlock = React.findDOMNode(this.refs.block);
    var $thisBlock = jQuery(thisBlock);

    var currentLeft = jQuery(thisBlock).position().left + 'px';
    jQuery(thisBlock).css('left', HE.utils.changeCssAttr(currentLeft , Math.round(event.dt * event.velocityX /1000)));

    var currentTop = jQuery(thisBlock).position().top + 'px';
    jQuery(thisBlock).css('top', HE.utils.changeCssAttr(currentTop , Math.round(event.dt * event.velocityY /1000)));

  },
  handleDragStart: function(event){
    var thisBlock = React.findDOMNode(this.refs.block);
    jQuery(thisBlock).addClass('he-dragging')
    window.he_draggingBlock = this;
  },
  handleDragEnd: function(event){
    var thisBlock = React.findDOMNode(this.refs.block);
    jQuery(thisBlock).css('top', 'auto')
                    .css('left', 'auto');
    jQuery(thisBlock).removeClass('he-dragging')
  },
  getBlockData: function(){
    return jQuery.extend(true, {}, this.getLab().getVal());
  },
  handleHeaderClick: function(e){
    var $this = jQuery(React.findDOMNode(this));
    $this.find('.__Body').toggleClass('_LoadContent');
    //fetch content from server if required
    this.fetchContent();
  },
  defaultRender: function(){
    return <div className="he-DesignBlock he-ConfigBlock" style={this.getStyle()} ref="block">
            <div className="__Head" onClick={this.handleHeaderClick}>{this.getLab().get('title')}</div>
            <div className="__Body">{this.getContent()}</div>
          </div>;
  }
}

var editableMixins = {
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;

    //on keypress
    jQuery(thisElement).on('keydown', function(event){
      switch(event.keyCode){
        case 38:
          event.stopImmediatePropagation();
          break;
        case 46:
          //delete
          self.removeBlock();
          event.stopImmediatePropagation();
      }
    })
  },
  componentDidUpdate: function(){
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
    //set active block
    var activeBlock = self.getLab().getState('activeBlock', null);
    if(activeBlock && activeBlock == self.getLab().getFullNS()){
      setTimeout(function(){
        jQuery(document).trigger('blockactivate',[null, self.getLab()]);
        // jQuery(thisElement).focus();
      },10);
    }
  },
  removeBlock: function(){
    this.getLab().clear();
  },  
}
/////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////// Mixins ///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////// Block /////////////////////////////////////////
HEUI = React.createClass({
  render: function(){
    return '';
  }
})
///////////////////////////////////// Block /////////////////////////////////////////

///////////////////////////////////// Block.Atrributes //////////////////////////////
HEUI.Attributes = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive],
  getStyle: function(){
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})  
    
    //merge style
    return _.merge(style, labStyle);
  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
    jQuery(document).on('blockactivate', function(event, revent, lab){
      if(HE.utils.isLab(lab)){
        self.setLab(lab);
      }
    })
  },
  handleChangeStyles: function(event){
    var inputName = event.target.name
    var currentVal = this.getLab().get('style.' + inputName);
    var adj = 0;
    switch(event.keyCode) {
      case 38: //arrow up key
        adj = 1;
        break;
      case 40: //arrow down key
        adj = -1;
        break;
      default:
        break;
    }
    if(adj !== 0) {
      this.getLab().set('style.' + inputName, HE.utils.changeCssAttr(currentVal , adj));
    }
  },
  updateBlockAttribute: function(e){
    //just delegate update action to plugin
    var contentAction = this.getLab().get('contentAction');
    var self = this;
    if(contentAction){
      HE.utils.nextTick(function(){
        HE.hook.do_action('updateBlockAttribute__' + contentAction, self)
      })
    }
  },
  render: function(){
    var attributes = this.getStyle();
    var self = this;
    var optionsLab = self.getLab().link('options');
    //prepare options
    var options = optionsLab.getVal(undefined);
    var optionNodes = null;
    if(options && typeof options === 'object'){
        var optionKeys = Object.keys(options)
        optionNodes = optionKeys.map(function(val, key) {
          if(options[val].componentName !== undefined){
            var componentName = HE.utils.getComponentFromStr(options[val].componentName);
            var componentLab = optionsLab.link(val + '.value')
            if(componentLab){
              var props = jQuery.extend(true, {}, options[val]);
              //unset value key
              if(props['value'] !== undefined){
                delete props['value'];
              }
              props = jQuery.extend(true, props, {key: key, "value": componentLab, onChangeCapture:self.updateBlockAttribute})
              return React.createElement(componentName, props)
            } else {
              return null;
            }
          } else {
            return null;
          }
        })
    }
    return <div className="he-AttributeBlock" ref="block">
            <HE.UI.components.Panel className="__Basic _pointer">
              <div>Basic Settings</div>
              <div>
                <HE.UI.components.Form.Text key="title" name="title" title="title" value={self.getLab().link('title')}>
                </HE.UI.components.Form.Text>
                <HE.UI.components.Form.Text key="name" name="name" title="name" value={self.getLab().link('name')}>
                </HE.UI.components.Form.Text>
                <HE.UI.components.Form.Text key="type" name="type" title="type" value={self.getLab().link('type')}>
                </HE.UI.components.Form.Text>
              </div>
            </HE.UI.components.Panel>
            {
            optionNodes?
              <HE.UI.components.Panel className="__Options _pointer">
                <div>Options</div>
                <div>
                  {optionNodes}
                </div>
              </HE.UI.components.Panel>
            :null
            }
            <HE.UI.components.Panel className="__Styling _pointer">
              <div>Style Settings</div>
              <div>
              {jQuery.map(attributes, function(value, key){
                if(self.getLab()){
                  return <HE.UI.components.Form.Text onKeyDown={self.handleChangeStyles} key={key} name={key} title={key} value={self.getLab().link('style.' + key)}>
                        </HE.UI.components.Form.Text>                
                } else {
                  return null;
                }
              })}
              </div>
            </HE.UI.components.Panel>
          </div>;
  }
})
///////////////////////////////////// Block.Atrributes //////////////////////////////

///////////////////////////////////// Block.Content /////////////////////////////////////////
///////////////////////////////////// Block.Content /////////////////////////////////////////

///////////////////////////////////// Block.ConfigList //////////////////////////////
HEUI.ConfigList = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive],
  getStyle: function(){
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})  
    
    //merge style
    return _.merge(style, labStyle);
  },
  componentDidMount: function () {
  },
  render: function(){
    var self = this;
    var containerBlocksLab = this.getLab().link('containerBlocks',[])
    var contentBlocksLab = this.getLab().link('contentBlocks',[])

    return <div className="he-ConfigBlockList" ref="block">
            <div className="__ContainerBlocks">
            {
              containerBlocksLab.getVal()?
              containerBlocksLab.getVal().map(function(val, key){
                if(val.type !== undefined){
                  var componentName = HE.utils.getComponentByBlockType(val.type, 'Config');
                  return React.createElement("div", {"key": key},
                          React.createElement(componentName, {"data-lab": containerBlocksLab.link(key)})
                        )
                } else {
                  return null;
                }
              }):null
            }
            </div>
            <div className="__ContentBlocks">
            {
              contentBlocksLab.getVal()?
              contentBlocksLab.getVal().map(function(val, key){
                if(val.type !== undefined){
                  var componentName = HE.utils.getComponentByBlockType(val.type, 'Config');
                  return React.createElement("div", {"key": key},
                          React.createElement(componentName, {"data-lab": contentBlocksLab.link(key)})
                        )
                } else {
                  return null;
                }
              }):null
            }
            </div>
          </div>;
  }
})
///////////////////////////////////// Block.ConfigList //////////////////////////////

///////////////////////////////////// Block.BoxList //////////////////////////////
HEUI.BoxList = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive],
  getInitialState: function(){
    return {selectedBox:0};
  },
  getStyle: function(){
  },
  getBox: function(lab){
    var isCollapsed = (this.state.selectedBox == lab.getShortNS())?0:1
    return <HE.UI.components.Panel className="__Basic _pointer" data-collapsed={isCollapsed}>
            <div onClick={this.toggleBox.bind(this, lab)}>{lab.get('title')}</div>
            <div>
              <button onClick={this.editBox.bind(this, lab)}>Edit</button>
              <button onClick={this.removeBox.bind(this, lab)}>Delete</button>
            </div>
          </HE.UI.components.Panel>

  },
  toggleBox: function(lab){
    var selectedBox
    if(this.state.selectedBox == lab.getShortNS()){
      selectedBox = null;
    } else {
      selectedBox = lab.getShortNS();
      HE.HEState.setState('selectedBox', selectedBox)
    }
    this.setState({selectedBox:selectedBox})
  },
  removeBox: function(lab){
    lab.clear('');
  },
  addBox: function(event){
    this.getLab().push('', {title:'New Box', name:'box', type:'box', style:{width:'300px', height:'300px'}, blocks:[]})
  },
  editBox: function(lab){
    HE.HEState.setState('editingBox', lab.getShortNS())
  },
  render: function(){
    var self = this;
    var boxes = this.getLab().getVal([]);
    var boxesList = boxes.map(function(val, key){
      return <div key={key}>
              {self.getBox(self.getLab().link(key))}
            </div>
    });
    return <div className="he-BoxList" ref="block">
            <div className="__List">
            {boxesList}
            <div>
              <button onClick={this.addBox}>New Box</button>
            </div>
            </div>
          </div>;
  }
})
///////////////////////////////////// Block.BoxList //////////////////////////////

HEUI.Content = {}

///////////////////////////////////// Block.Content.Config //////////////////////////////
HEUI.Content.Config = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive,
          configurableMixins, blockAttributeMixins, blockContentMixins],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    return _.merge(defaultStyle, style, labStyle);
  },
  getDefaultStyle: function(){
    return {padding: '0px'};
  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
  },
  render: function(){
    return this.defaultRender();
  }
})
///////////////////////////////////// Block.Content.Config //////////////////////////////

///////////////////////////////////// Block.Content.Edit //////////////////////////////
HEUI.Content.Edit = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive, 
          resizeableMixins, 
          draggableMixins, 
          editableMixins, 
          blockAttributeMixins,
          blockContentMixins],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    return _.merge(defaultStyle, style, labStyle);
  },
  getDefaultStyle: function(){
    return {width:'auto', height: 'auto', top: '0px', left: '0px', padding: '0px'};
  },
  dropHandler: function(event){

  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
  },
  handleDoubleClick: function(event){
    this.getLab().set('style.height', 'auto')
                  .set('style.width', 'auto');
  },

  render: function(){
    var self = this;
    //fetch content data if not exist
    this.fetchContent();

    return <div className="he-DesignBlock he-ContentBlock" style={this.getStyle()} onDoubleClick={this.handleDoubleClick} ref="block" tabIndex={this.getTabIndex()}>
              <div className="__ContentReadOnly" >
                {this.getContent()}
              </div>
              <div className="__ContentOverlay">
              </div>
          </div>;
  }
})
///////////////////////////////////// Block.Content.Edit //////////////////////////////

///////////////////////////////////// Block.Content.Attributes ////////////////////////
///////////////////////////////////// Block.Content.Attributes ////////////////////////

///////////////////////////////////// Block.Content.View //////////////////////////////
HEUI.Content.View = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive, 
          blockContentMixins],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    return _.merge(defaultStyle, style, labStyle);
  },
  getDefaultStyle: function(){
    return {width:'auto', height: 'auto', top: '0px', left: '0px', padding: '0px'};
  },

  render: function(){
    var self = this;
    //fetch content data if not exist
    this.fetchContent();

    return <div className="he-ViewBlock he-ContentBlock" style={this.getStyle()} ref="block">
              {this.getContent()}
          </div>;
  }
})
///////////////////////////////////// Block.Content.View //////////////////////////////


HEUI.Box = {}
///////////////////////////////////// Block.Box.Edit //////////////////////////////
HEUI.Box.Edit = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive, 
            resizeableMixins, dropableMixins, blockAttributeMixins],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    style = _.merge(defaultStyle, style, labStyle);

    return style;
  },
  getDefaultStyle: function(){
    return {width:'100px', height: '100px', padding: '0px'};
  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;

  },
  render: function(){
    var childBlocks = this.getLab().get('blocks', []);
    var self = this;
    return <div className="he-DesignBlock he-Box __Design _Center" style={this.getStyle()} ref="block">
            {
              childBlocks.length?
              childBlocks.map(function(val, key) {
                if(val.type !== undefined){
                  var componentName = HE.utils.getComponentByBlockType(val.type, 'Edit');
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
///////////////////////////////////// Block.Box.Edit //////////////////////////////

///////////////////////////////////// Block.Box.Attributes ////////////////////////
///////////////////////////////////// Block.Box.Attributes ////////////////////////

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
    return {width:'100px', height: '100px', padding: '0px'};
  },
  render: function(){
    var childBlocks = this.getLab().get('blocks', []);
    var self = this;
    return <div className="he-ViewBlock he-Box __View _Center" style={this.getStyle()} ref="block">
            {
              childBlocks.length?
              childBlocks.map(function(val, key) {
                if(val.type !== undefined){
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

///////////////////////////////////// Container layout ////////////////////////////
HEUI.Container = {}

HEUI.Container.Absolute = {}
///////////////////////////////////// Block.Container.Absolute.Config //////////////////////////////
HEUI.Container.Absolute.Config = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive,
          configurableMixins, blockAttributeMixins, blockContentMixins],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    return _.merge(defaultStyle, style, labStyle);
  },
  getDefaultStyle: function(){
    return {padding: '0px'};
  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
  },

  render: function(){
    return this.defaultRender();
  }
})
///////////////////////////////////// Block.Container.Absolute.Config //////////////////////////////

///////////////////////////////////// Block.Container.Absolute.Edit //////////////////////////////
HEUI.Container.Absolute.Edit = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive, 
            resizeableMixins, draggableMixins, dropableMixins, editableMixins, blockAttributeMixins],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    return _.merge(defaultStyle, style, labStyle);
  },
  getDefaultStyle: function(){
    return {width:'60px', height: '60px', top: '0px', left: '0px', padding: '0px'};
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
    return <div className="he-DesignBlock he-ContainerBlock__Absolute_Edit" style={this.getStyle()} ref="block" tabIndex={this.getTabIndex()}>
            {
              childBlocks.length?
              childBlocks.map(function(val, key) {
                if(val.type !== undefined){
                  var componentName = HE.utils.getComponentByBlockType(val.type, 'Edit');
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
///////////////////////////////////// Block.Container.Absolute.Edit //////////////////////////////

///////////////////////////////////// Block.Container.Absolute.Attributes ////////////////////////
///////////////////////////////////// Block.Container.Absolute.Attributes ////////////////////////

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
    return {width:'60px', height: '60px', top: '0px', left: '0px', padding: '0px'};
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
    return <div className="he-ViewBlock he-ContainerBlock__Absolute_View" style={this.getStyle()} ref="block">
            {
              childBlocks.length?
              childBlocks.map(function(val, key) {
                if(val.type !== undefined){
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

HEUI.Container.Vertical = {}

///////////////////////////////////// Block.Container.Vertical.Config //////////////////////////////
HEUI.Container.Vertical.Config = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive,
          configurableMixins, blockAttributeMixins, blockContentMixins],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    return _.merge(defaultStyle, style, labStyle);
  },
  getDefaultStyle: function(){
    return {padding: '0px'};
  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
  },

  render: function(){
    return this.defaultRender();
  }
})
///////////////////////////////////// Block.Container.Vertical.Config //////////////////////////////


HEUI.Container.Sortable = React.createClass({
  mixins: [HE.UI.mixins.common],
  getInitialState: function() {
    return {'dropTarget': false};
  },  
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var shadowElement = React.findDOMNode(this.refs.shadow);
    var self = this;
    var cloneTarget = null;
    //dropzone
    var interactOpts = {
      // Require a 75% element overlap for a drop to be possible
      overlap: 0.10,

      // listen for drop related events:

      ondropactivate: function (event) {
        // add active dropzone feedback
        // event.target.classList.add('he-dropActive');
      },
      ondragenter: function (event) {
        var draggableElement = event.relatedTarget,
            dropzoneElement = event.target;

        //do not allow to drag to node children
        self.setState({'dropTarget': true})
        dropzoneElement.classList.add('he-hasDragItem');
        draggableElement.classList.add('he-canDrop');
      },
      ondragleave: function (event) {
        var draggableElement = event.relatedTarget,
            dropzoneElement = event.target;
        self.setState({'dropTarget': false})

        event.target.classList.remove('he-hasDragItem');
        event.relatedTarget.classList.remove('he-canDrop');
      },
      ondrop: function (event) {
        self.setState({'dropTarget': false})

        var container = self.props['data-container'];
        var oldPos, newPos
        if(self.refs.sortableContent){
          var dropLab = self.refs.sortableContent.getLab();
          var dragLab = window.he_draggingBlock.getLab();
          newPos = parseInt(dropLab.getShortNS())
          oldPos = parseInt(dragLab.getShortNS())
          //do adjustment for dropping on the same sortable level
          if(dropLab.getParentNS() == dragLab.getParentNS()){
            if(oldPos < newPos){
              newPos --;
            }
          }
          if(oldPos == newPos){
              return; //position is not change, just let framework redraw
          } else {
            window.he_draggingBlock.handleDroppedIn(container, newPos)
          }
        } else {
          //drop to sortable place holder, just append it
          window.he_draggingBlock.handleDroppedIn(container)
        }
      },
      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        // event.target.classList.remove('he-dropActive');
        event.target.classList.remove('he-hasDragItem');
      }
    };
    
    interactOpts = jQuery.extend(true, {}, self.interactOpts, interactOpts);
    interact(thisElement).dropzone(interactOpts);

    interact(thisElement)
      .draggable({})
      .on('dragmove', this.dragHandler)
      .on('dragstart', this.dragStart)
      .on('dragend', this.dragEnd)
      ;

    // assign children drag events
    function delegateEvent(event){
      event.relatedTarget = thisElement;
      return event;
    }
    if(thisElement.firstChild){
      interact(thisElement.firstChild)
        .on('dragmove', function(event){self.dragHandler(delegateEvent(event))})
        .on('dragstart', function(event){self.dragStart(delegateEvent(event))})
        .on('dragend', function(event){self.dragEnd(delegateEvent(event))})

    }
  },
  handleDroppedIn: function(container, pos){
    var self = this;
    if(self.refs.sortableContent){
      var blockData = jQuery.extend(true, {}, self.refs.sortableContent.getLab().getVal());
      self.refs.sortableContent.getLab().clear();
      pos = container.getLab().push('blocks', blockData, pos);

      //keep this droppedin block as active
      var activeBlock = container.getLab().getFullNS('blocks.' + pos);
      container.getLab().setState('activeBlock', activeBlock);
    }
  },
  dragStart: function(event){
    window.he_draggingBlock = this.refs.sortableContent;
    var thisBlock = React.findDOMNode(this.refs.block);
    jQuery(thisBlock).addClass('he-dragging')
  },
  dragEnd: function(event){
    var thisBlock = React.findDOMNode(this.refs.block);
    jQuery(thisBlock).removeClass('he-dragging')
  },
  dragHandler: function(event){
    var thisBlock = React.findDOMNode(this.refs.block);
    var currentLeft = jQuery(thisBlock).position().left + 'px';
    var newLeft = HE.utils.changeCssAttr(currentLeft , Math.round(event.dt * event.velocityX /1000));

    var currentTop = jQuery(thisBlock).position().top + 'px';
    var newTop = HE.utils.changeCssAttr(currentTop , Math.round(event.dt * event.velocityY /1000));
    jQuery(thisBlock).css('left', newLeft)
                      .css('top', newTop)
  },
  render: function(){
    var self = this; 
    var childBlock = React.Children.map(this.props.children,
                      function(child, key) {
                        return React.addons.cloneWithProps(child, {ref: 'sortableContent'});
                      }
                    );
    var childShadow = React.Children.map(this.props.children,
                      function(child, key) {
                        return React.addons.cloneWithProps(child, {ref: 'sortableShadowContent'});
                      }
                    );
    return <div className={this.getClass('he-SortableBlock')} ref="block">
              <div className="__Content" ref="content" key="content">
              {
                childBlock
              }
              </div>
              {
                this.state.dropTarget?
                <div className="__Shadow" ref="sortableShadow" key="shadow">
                  {
                    childShadow
                  }
                </div>
                :null
              }
          </div>;
  }  
})

///////////////////////////////////// Block.Container.Vertical.Edit //////////////////////////////
HEUI.Container.Vertical.Edit = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.responsive, 
            resizeableMixins, draggableMixins, dropableMixins, editableMixins, blockAttributeMixins],
  getStyle: function(){
    var defaultStyle = this.getDefaultStyle();
    var style = this.props.style;
    var labStyle = this.getLab().get('style', {})
    //merge style
    return _.merge(defaultStyle, style, labStyle);
  },
  getDefaultStyle: function(){
    return {width:'60px', height: '60px', top: '0px', left: '0px', padding: '0px'};
  },
  dropHandler: function(event){

  },
  componentDidMount: function () {
    var thisElement = React.findDOMNode(this.refs.block);
    var self = this;
  },
  handleDoubleClick: function(event){
    this.getLab().set('style.height', 'auto');
  },
  render: function(){
    var childBlocks = this.getLab().get('blocks', []);
    var self = this;
    return <div className="he-DesignBlock he-ContainerBlock__Vertical_Edit" onDoubleClick={this.handleDoubleClick} style={this.getStyle()} ref="block" tabIndex={this.getTabIndex()}>
            {
              childBlocks.length?
              childBlocks.map(function(val, key) {
                if(val.type !== undefined){
                  var componentName = HE.utils.getComponentByBlockType(val.type, 'Edit');
                  var childLab = self.getLab().link('blocks.' + key)
                  return React.createElement(HEUI.Container.Sortable, {key: key, "data-container": self},
                          React.createElement(componentName, {"data-lab": childLab})
                        )
                } else {
                  return null;
                }
              })
              :null
            }
            <HEUI.Container.Sortable className="__Placeholder" key="a" data-container={self}></HEUI.Container.Sortable>
          </div>;
  }
})
///////////////////////////////////// Block.Container.Vertical.Edit //////////////////////////////

///////////////////////////////////// Block.Container.Vertical.Attributes ////////////////////////
///////////////////////////////////// Block.Container.Vertical.Attributes ////////////////////////

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
    return {width:'60px', height: '60px', top: '0px', left: '0px', padding: '0px'};
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
    return <div className="he-ViewBlock he-ContainerBlock__Vertical_View" style={this.getStyle()} ref="block">
            {
              childBlocks.length?
              childBlocks.map(function(val, key) {
                if(val.type !== undefined){
                  var componentName = HE.utils.getComponentByBlockType(val.type, 'View');
                  var childLab = self.getLab().link('blocks.' + key)
                  return React.createElement(HEUI.Container.Sortable, {key: key, "data-container": self},
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

HEUI.Container.Horizontal = {}

///////////////////////////////////// Block.Container.Horizontal.Config //////////////////////////////
///////////////////////////////////// Block.Container.Horizontal.Config //////////////////////////////

///////////////////////////////////// Block.Container.Horizontal.Edit //////////////////////////////
///////////////////////////////////// Block.Container.Horizontal.Edit //////////////////////////////

///////////////////////////////////// Block.Container.Horizontal.Attributes ////////////////////////
///////////////////////////////////// Block.Container.Horizontal.Attributes ////////////////////////

///////////////////////////////////// Block.Container.Horizontal.View //////////////////////////////
///////////////////////////////////// Block.Container.Horizontal.View //////////////////////////////

module.exports = HEUI;