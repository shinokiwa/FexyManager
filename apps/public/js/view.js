$(document).ready(function() {
  view.init();
  $('h1 > a').click(function(e) {
    e.preventDefault();
    return view.show(index);
  });
	if ((location.hash != null) && location.hash.length > 1) {
	  return view.show(index);
	} else {
//	  return view.show(detail);
	}
});

var view = {
  list: [],
  init: function() {
    var v, _i, _len, _ref, _results;
    _ref = view.list;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      _results.push(typeof v.init === "function" ? v.init() : void 0);
    }
    return _results;
  },
  show: function(target) {
    for (var i = 0; i < view.list.length; i++) {
    	view.list[i].hidden();
    }
    target.display();
  }
};
