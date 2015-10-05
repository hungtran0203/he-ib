var React = require('react');

var HEForm = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common],
  render: function() {
    return (
      <form className={this.getClass('form')} role="form">
        {this.props.children}
      </form>
    );
  }

}); //CommentForm

///////////////////////////////////// Form.Text /////////////////////////////////////////
HEForm.Text = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.input],
  render: function(){
    return (
      <div className="form-group">
        {this.hasTitle()?<label>{this.getTitle()}</label>:''}
        <input {...this.except(['className', 'value', 'title', 'data-lab'])} className={this.getClass('form-control')} type="text" valueLink={this.getValueLink()}  ref="input"/>
      </div>
    );
  }
})
///////////////////////////////////// Form.Text /////////////////////////////////////////

///////////////////////////////////// Form.TextArea /////////////////////////////////////////
HEForm.TextArea = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.input],
  render: function(){
    return (
      <div className="form-group">
        {this.hasTitle()?<div className="form-label">{this.getTitle()}</div>:''}
        <textarea {...this.except(['className', 'value'])} className={this.getClass('form-control')} type="text" valueLink={this.getValueLink()} ref="input"/>
      </div>
    );
  }
})
///////////////////////////////////// Form.TextArea /////////////////////////////////////////

///////////////////////////////////// Form.Select /////////////////////////////////////////
HEForm.Select = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.input],
  render: function(){
    var options = this.props['data-options']
    return (
      options && options.length?
      <div className="form-group">
        {this.hasTitle()?<label>{this.getTitle()}</label>:''}
        <select {...this.except(['className', 'value', 'title', 'data-lab'])} className={this.getClass('form-control')} valueLink={this.getValueLink()}  ref="input">
          {
            options.map(function(val, key){
              return (<option key={key} value={val.value}>{val.title?val.title:val.value}</option>)
            })
          }
        </select>        
      </div>
      :null
    );
  }
})
///////////////////////////////////// Form.Select /////////////////////////////////////////

///////////////////////////////////// Form.Label /////////////////////////////////////////
HEForm.Label = React.createClass({
  mixins: [HE.UI.mixins.common, HE.UI.mixins.input, React.addons.LinkedStateMixin],
  render: function(){
    return (
      <div className="form-group">
        <label>{this.getTitle()}</label>
      </div>
    );
  }
})
///////////////////////////////////// Form.Label /////////////////////////////////////////

///////////////////////////////////// Form.Submit /////////////////////////////////////////
HEForm.Submit = React.createClass({
  mixins: [HE.UI.mixins.common],
  render: function(){
    return (
      <button {...this.except('className')} type="submit" className={this.getClass("btn btn-default")} value={this.getTitle()}  ref="input">{this.getTitle()}</button>
    );
  }
})
///////////////////////////////////// Form.Submit /////////////////////////////////////////

///////////////////////////////////// Form.Shortcode /////////////////////////////////////////
HEForm.Shortcode = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common, HE.UI.mixins.input],
  getShortcodeOptions: function(){
    var self = this;
    var shortcodeType = self.props['sType']?self.props['sType']:'';
    if(self.shortcodeOptions === undefined){
      HE.storage.get('shortcodes', {type:shortcodeType}, function(data){
        var options;
        if(Array.isArray(data)){
          options = data;
        } else {
          options = null;
        }
        self.setShortcodeOptions(options);
      });
      return [];
    }
    return this.shortcodeOptions;
  },
  setShortcodeOptions: function(options){
    this.shortcodeOptions = options;
    this.forceUpdate();
  },
  changeShortcode: function(event){
    this.setState({selectedShortcode:event.target.value});
    //reset the current selected shortcode lab
    var self = this;
    var shortcodeOptions = this.getShortcodeOptions();
    var selectedShortcode = shortcodeOptions.filter(function(shortcode){
      return shortcode.value == event.target.value;
    }).shift();

    this.shortcodeLab = HE.lab.init(jQuery.extend(true, {}, selectedShortcode));
  },
  insertShortcode: function(event){
    var shortcode = React.findDOMNode(this.refs.shortcode);

    //generate shortcode attributes
    var shortcodeValue = this.shortcodeLab.get('value')
    var attStr = ''
    var shortcodeOptions = this.getShortcodeOptions();
    var defaultShortcode = shortcodeOptions.filter(function(shortcode){
      return shortcode.value == shortcodeValue;
    }).shift();
    var shortcodeAtts = this.shortcodeLab.get('atts',{});
    for(var att in shortcodeAtts){
      if(shortcodeAtts[att] === defaultShortcode.atts[att]){
        //using default att, don't need to include this att
        delete shortcodeAtts[att]
      } else {
        attStr = ' ' + att + '="' + shortcodeAtts[att] + '"'
      }
    }

    //generate shortcode string
    var shortcodeStr = '[' + shortcodeValue + attStr + ']'
    this.setValue(this.getValue() + shortcodeStr);
    if(this.props.onChangeCapture){
      this.props.onChangeCapture()  
    }

    this.setState({showShortCodeForm: false, selectedShortcode:''});
  },
  showShortCodeForm: function(){
    this.setState({showShortCodeForm: true});
  },
  cancleShortcodeForm: function(){
    this.setState({showShortCodeForm: false, selectedShortcode:''});
  },
  getShortcodeAttributes: function(){
    var self = this;
    if(this.shortcodeLab && Object.keys(this.shortcodeLab.get('atts',{})).length > 0){
      var shortcodeAtts = this.shortcodeLab.get('atts',{});
      var attKeys = Object.keys(shortcodeAtts);
      return (
      <div className="he-Shortcode_Attributes" ref="atts">
        <h4>Shortcode Attributes</h4>
        {attKeys.map(function(key, id){
          var attLab = self.shortcodeLab.link('atts.' + key);
          var att = <HE.UI.components.Form.Text key={HE.utils.getTabIndex()} name={key} title={key} value={attLab}></HE.UI.components.Form.Text>
          return att;
        })
        }
      </div>
      )
    } else {
      return null;
    }
  },
  getShortcodeForm: function(){
    var shortcodeOptions = this.getShortcodeOptions();
    return (
    <div className="he-Shortcode_Form">
      <select className={this.getClass('form-control')} onChange={this.changeShortcode} ref="shortcode">
        <option value=''>Select shortcode to insert</option>
        {
          shortcodeOptions.map(function(val, key){
            return (<option key={key} value={val.value}>{val.title?val.title:val.value}</option>)
          })
        }
      </select>
      {this.state.selectedShortcode?
      (<div>
        {this.getShortcodeAttributes()}
        <div className="he-groupBtn">
          <button className="button button-primary button-row" onClick={this.insertShortcode}>Insert</button>
          <button className="button button-row" onClick={this.cancleShortcodeForm}>Cancel</button>
        </div>
      </div>)
      :null
      }
    </div>
    )
  },
  render: function(){
    //get list of available shortcodes
    var shortcodeOptions = this.getShortcodeOptions();
    if(shortcodeOptions === null){
      return null;
    } else if(Array.isArray(shortcodeOptions) && shortcodeOptions.length) {
      var val = this.getValue();
      var editorClass = '';
      if(val === ''){
        editorClass = ' he-hidden';
      }
      return (
        <div className="form-group">
          {this.hasTitle()?<div className="form-label">{this.getTitle()}</div>:''}
          <textarea {...this.except(['className', 'value'])} className={this.getClass('form-control' + editorClass)} type="text" valueLink={this.getValueLink()} ref="input"/>
          {
          shortcodeOptions.length?
            <div>
            {
            this.state.showShortCodeForm?
            this.getShortcodeForm()
            :<button className="button button-primary button-row" onClick={this.showShortCodeForm} title="Click to insert a shortcode">Insert Shortcode</button>
            }
            </div>
          :null
          }
        </div>
      );
    } else {
      return <HEForm.Loading></HEForm.Loading>      
    }
  }
})
///////////////////////////////////// Form.TextArea /////////////////////////////////////////

///////////////////////////////////// Form.Loading /////////////////////////////////////////
HEForm.Loading = React.createClass({
  render: function(){
    return <div>Loading</div>
  }
})
///////////////////////////////////// Form.Loading /////////////////////////////////////////

///////////////////////////////////// Form.Label /////////////////////////////////////////
HEForm.Span = React.createClass({
  mixins: [HE.UI.mixins.lab, HE.UI.mixins.common],
  render: function(){
    return <span>{this.getLab().getVal()}</span>
  }
})
///////////////////////////////////// Form.Label /////////////////////////////////////////


module.exports = HEForm;
