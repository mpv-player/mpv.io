(function($) {

  var $el, top, drawing = false, selections = [];

  function redraw() {
    var scroll = $(window).scrollTop();
    if (top < scroll){
      var offset = parseInt($el.data('sticky-offset') || 0);
      $el.addClass('sticked');
    } else {
      $el.removeClass('sticked');
    }
    $el.find('ul.active').removeClass('active');
    $el.find('li.active').removeClass('active');
    for (var i = 0; i < selections.length; i++) {
      var s = selections[i];
      var n = selections[i+1];
      var is_last = (i == selections.length-1);
      // if (Math.abs(scroll - s.top) < 10)
      //   console.log('xx:', scroll, s.top - 1, n.top);
      // - 1 are for firefox
      if ((scroll >= s.top - 1) && (is_last || scroll < n.top - 1)) {
        s.el.addClass('active');
        s.el.find('ul.level-' + (s.level+1)).addClass('active');
        for (var j = 0; j < s.parents.length; j++) {
          s.parents[j].addClass('active');
        }
      }
    }
    drawing = false;
  };

  function redrawAtRepaint() {
    if (!drawing) {
      drawing = true;
      if (window.requestAnimationFrame)
        window.requestAnimationFrame(redraw);
      else
        setTimeout(redraw, 66);
    }
  };

  function createMenuItem(id, title, level) {
    var $li = $('<li>');
    $li.addClass('level-' + level);
    $li.data('anchor', id);
    var $a = $('<a>');
    $a.attr('href', '#' + id);
    $a.text(title);
    $li.append($a);
    return $li;
  };

  function dasherize(string) {
    return string
      .toLowerCase()
      .replace(/[-_\s\.]+/g, '-'); // Replace whitespace, underscores with dashes
  }

  function createOptionsAnchors() {
    $('dt > tt.docutils').each(function() {
      var $x = $(this);
      var section = $x.parents('.section').find('h1').text();
      var text = $x.find('span').text() || $x.text();
      if (text && text.length > 1) {
        text = text.split('=')[0];
        text = text.split('://')[0];
        var anchor = dasherize(section + '-' + text);
        $x.attr('id', anchor);
        var $a = $('<a>');
        $a.attr('href', '#' + anchor);
        $a.addClass('anchor fa fa-link');
        $x.append($a);
      }
    });
  };

  function fixLiteralBlocks() {
    $('pre.literal-block').each(function() {
      var $x = $(this);
      var lines = ($x.text().split("\n"));
      var indent = /^\s+/.exec(lines[0]);
      indent = indent ? indent[0].length : 0;
      for (var i = 0; i < lines.length; i++)
        lines[i] = lines[i].slice(indent);
      $x.text(lines.join('\n'));
    });
  };

  function setChapters() {
    var sel = $el.data('navigation-source');
    if (!sel) return;
    var $source = $(sel);
    if (!$source.length) return;
    var tree = [$('<ul>')];
    tree[0].addClass('level-1');
    $source.find('.section').each(function(_, section) {
      var $section = $(section);
      var id = $section.attr('id');
      var $title = $($section.find(':first-child')[0]);
      if ($title) {
        var title = $title.text();
        var level = parseInt($title.prop('tagName').slice(1));
        var top   = $title.offset().top;
        var $li   = createMenuItem(id, title, level);
        var $ul   = $('<ul>');
        $ul.addClass('level-' + (level + 1));
        $li.append($ul);
        selections.push({
          top: top,
          level: level,
          id: id,
          el: $li,
          parents: tree.slice(0,level)
        });
        tree[level-1].append($li);
        tree[level] = $ul;
      } else {
        console.log('malformed chapter: ', id);
      }
    });
    $el.html(tree[0]);
  };

  function init() {
    $el = $('.sticky');
    var offset = $el.offset();
    if (!offset) return;
    createOptionsAnchors();
    fixLiteralBlocks();
    setChapters();
    top = offset.top;
    $(window).scroll(redrawAtRepaint);
    redrawAtRepaint();
  };

  $(init);

})(Zepto);
