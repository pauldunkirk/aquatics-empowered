app.controller('HomeController', ['$location', function($location) {
      var vm = this;


// thanks to https://developer.mozilla.org/en-US/docs/Web/Events/resize

      (function() {
          var throttle = function(type, name, obj) {
              obj = obj || window;
              var running = false;
              var func = function() {
                  if (running) { return; }
                  running = true;
                   requestAnimationFrame(function() {
                      obj.dispatchEvent(new CustomEvent(name));
                      running = false;
                  });
              };
              obj.addEventListener(type, func);
          };

          /* init - you can init any event */
          throttle("resize", "optimizedResize");
      })();

      // handle event
      // window.addEventListener("optimizedResize", function() {
      //     console.log("Resource conscious resize callback!");
      // });



// Thanks to https://eddyerburgh.me/animate-elements-scrolled-view-vanilla-js
// I changed resize to optimizedResize in event listener below due to above documentation
      var animateHTML = function () {
        var elements,
          windowHeight
        var init = function () {
          elements = document.getElementsByClassName('hidden');
          console.log('elements', elements);
          windowHeight = window.innerHeight;
          console.log('windowHeight', windowHeight);
          listenForScrollAndResize();
        } //end init
        
        var listenForScrollAndResize = function () {
          window.addEventListener('scroll', checkPosition);
          window.addEventListener('resize', init);
        } //end listenForScrollAndResize
        var checkPosition = function () {
          for (var i = 0; i < elements.length; i++) {
            var posFromTop = elements[i].getBoundingClientRect().top;
            console.log('?posFromTop always 0?', posFromTop, elements);
            if (posFromTop - windowHeight <= 0) {
              elements[i].className = elements[i].className.replace('hidden', 'willUseIdOnThatElement')
            } //end if
          } //end for
        } //end checkPosition

        return { init: init } //end return init

      } //end animateHTML
      animateHTML().init()











  }]);
