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
    var shortcode = event.target.value;
    this.setValue(this.getValue() + shortcode);
    if(this.props.onChangeCapture){
      this.props.onChangeCapture()  
    }
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
            <select className={this.getClass('form-control')} onChange={this.changeShortcode} ref="shortcode">
              <option value=''>Select shortcode to insert</option>
              {
                shortcodeOptions.map(function(val, key){
                  return (<option key={key} value={val.value}>{val.title?val.title:val.value}</option>)
                })
              }
            </select>
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

module.exports = HEForm;
