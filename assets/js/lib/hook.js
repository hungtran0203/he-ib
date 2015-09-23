	/* filter to append contextUrl to ajax requests */
	HE.hook.add_filter('prepareAjaxData', function(data){
		var contextUrl = HE.cache.get('heCurrentContextUrl');
		if(contextUrl !== undefined){
			data['contextUrl'] = contextUrl;
		}
		return data;
	})

	//////////////////////////////////////////////// shortcode block content hooks //////////////////////////////////////////////
	//add action to display shortcode block content
	HE.hook.add_filter('fetchBlockContent__shortcode', function(content, block){
		var shortcode = block.getLab().quite().get('options.shortcode.value');
		HE.storage.get('shortcode', {shortcode:shortcode}, function(res){
			var content = sanitizeShortcodeContent(res);
			block.setContent(content);
		})
		return 'Loading ...';
	})

	function sanitizeShortcodeContent(content){
		if(content == ''){
			//empty content, just give hint text
			content = '<span class="_Hint"><a href="javascript:void(0)" onclick="HE.utils.focusInput(\'option.html\');">Edit Content</a></span>'
		}
		return content;
	}
	//add action on update shortcode block attributes
	HE.hook.add_action('updateBlockAttribute__shortcode', function(attrBlock){
		//clear content cache 
		var key = attrBlock.getLab().getDataId();
	  var contextId = HE.cache.rememberForever('heCurrentContextId', 'context');
	  HE.cache.forget('____cachedContentKey.' + contextId + '.' + key);
	  //force update content
	  attrBlock.getLab().refresh();
	})

	//////////////////////////////////////////////// html block content hooks //////////////////////////////////////////////
	//add action to display html block content
	HE.hook.add_filter('fetchBlockContent__html', function(content, block){
		content = block.getLab().quite().get('options.html.value');
		content = sanitizeHtmlContent(content);
		return content;
	})
	function sanitizeHtmlContent(content){
		if(content == ''){
			//empty content, just give hint text
			content = '<span class="_Hint"><a href="javascript:void(0)" onclick="HE.utils.focusInput(\'option.html\');">Edit Content</a></span>'
		}
		return content;
	}
	//add action on update html block attributes
	HE.hook.add_action('updateBlockAttribute__html', function(attrBlock){
		attrBlock.getLab().clear('____cachedContentKey');	//clear key to force update content
	})
