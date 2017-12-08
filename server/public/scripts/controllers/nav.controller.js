app.controller('NavController', ['$location', function($location) {

      const vm = this;
      vm.isCollapsed = true;

      vm.toggleNav = function(){
      vm.isCollapsed = !vm.isCollapsed;
      // console.log('toggleNav function, vm.isCollapsed', vm.isCollapsed);
      };

  }]);
