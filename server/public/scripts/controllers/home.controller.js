app.controller('HomeController', ['$location', function($location) {
      var vm = this;

      var animateHTML = function () {
        var elements,
          windowHeight
        var init = function () {
          elements = document.getElementsByClassName('hidden')
          windowHeight = window.innerHeight
          listenForScrollAndResize()
        }
        var listenForScrollAndResize = function () {
          window.addEventListener('scroll', checkPosition)
          window.addEventListener('resize', init)
        } //end listenForScrollAndResize
        var checkPosition = function () {
          for (var i = 0; i < elements.length; i++) {
            var posFromTop = elements[i].getBoundingClientRect().top;
            console.log('posFromTop', posFromTop);
            if (windowHeight - posFromTop  >= 400) {
              elements[i].className = elements[i].className.replace('hidden', 'willDefaultToIdOnThatElement')
            } //end if
          } //end for
        } //end checkPosition
        return {
          init: init
        } //end return of animateHTML
      } //end animateHTML
      animateHTML().init()











  }]);
