(function () {
  'use strict';
  Backbone.View = (function (View) {
    return View.extend({
      constructor: function (options) {
        this.options = options || {};
        View.apply(this, arguments);
      }
    });
  })(Backbone.View);
})();
