app.controller('NavController', ['$location', function($location) {

      const vm = this;
      vm.isCollapsed = true;
      vm.toggleNav = function(){
      vm.isCollapsed = !self.isCollapsed;
    };
  }]);
