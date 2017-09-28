app.controller('NavController', ['$location', function($location) {

      var self = this;
      self.isCollapsed = true;
      self.toggleNav = function(){
      self.isCollapsed = !self.isCollapsed;
    };
  }]);
