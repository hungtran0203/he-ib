var	userMixins = {
		  getInitialState: function() {
		  	return {};
			},
			getDisplayName: function(){
				return this.getLab().get('firstname') + this.getLab().get('lastname');
			},
			getAvatarUrl: function(){
				return this.getLab().get('avatar.url');
			},
			getCoverUrl: function(){
				return this.getLab().get('cover.url');
			}
  	}

module.exports = userMixins;
