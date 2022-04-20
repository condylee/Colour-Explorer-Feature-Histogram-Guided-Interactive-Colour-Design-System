// Farbtastic Color Picker 1.3
// Made by Steven Wittens and Update by Chisame Muko

// Compatibility :
//    [Support] Chrome, Firefox, Safari, Opera
//    [Half support] IE version > 9

// Usage methods (container and jquery.js is essential) :
//    jQuery Method :
//        $(container).farbtastic(callback, size)
// 
//    Object Method :
//        $.farbtastic(container, callback, size)
// 
//    Functions :
//        .linkTo(callback)
//            Allows you to set a new callback. Any existing callbacks are removed. See above for the meaning of callback.
// 
//        .setColor(value)
//            Sets the picker color to the given color in "value".
//            "value" could be Color Code (eg: "#123456") or HSL Code (0-1 | eg: [1, 0.8, 0.4]) or RGB Code (0-255 | eg: [0, 128, 255]).
// 
//    Properties :
//        .color
//        .hsl
//        .rgb
//            Current color in hex representation / HSL / RGB.
//
//        .linked
//            The elements or callback function this picker is linked to.

// Changelog :
//    [v1.3 - 2019/10/14]
//        Update by Chisame Muko.
//        Added custom size parameter and attributes of RGB code.
//        Adjusted the transfer mode of setting color parameters.
//        Fixed the problem of value error after selector exceeded the boundary.
//        Replace the original image-based plug-in layout with style approach.
//        Simplified plug-in files.
// 
//    [v1.2 - 2007/01/08]
//        Fixed bug with linking multiple fields with the same value.
//        [v1.1 - 2006/10/27]
//        Work around for the transparent PNGs in Internet Explorer.
//        Better mouse handling code to accomodate CSS-based layouts better.
// 
//    [v1.0 - 2006/07/14]
//        Initial release.



jQuery.fn.farbtastic = function (callback, size) {
  $.farbtastic(this, callback, size);
  return this;
};

jQuery.farbtastic = function (container, callback, size) {
  var container = $(container).get(0);
  return container.farbtastic || (container.farbtastic = new jQuery._farbtastic(container, callback, size));
};

jQuery._farbtastic = function (container, callback, size) {
  // Store farbtastic object
  $(container).html('<div class="farbtastic">'+
    '<div class="wheel">'+
    '<div class="wheelBlock"><div id="wheel-1"></div></div>'+
    '<div class="wheelBlock"><div id="wheel-2"></div></div>'+
    '<div class="wheelBlock"><div id="wheel-4"></div></div>'+
    '<div class="wheelBlock"><div id="wheel-3"></div></div>'+
    '<div id="wheel-A"></div>'+
    '<div id="wheel-B"></div>'+
    '<div id="wheel-C"></div>'+
    '<div id="wheel-D"></div>'+
    '<div id="wheelMask"></div></div>'+
    '<div class="color"></div>'+
    '<div class="overlay"><div><div></div></div></div>'+
    '<div class="h-marker marker"></div>'+
    '<div class="sl-marker marker"></div></div>'
  );
  
  // Insert markup
  var fb = this;
  var e = $('.farbtastic', container);
  if (size && size != "auto") {
    if (typeof size == 'string') {size = Number(size.replace(/[^0-9\.]/g,""));}
    fb.size = size;
  }
  else if (!size || size == "auto") {
    var c_w = $(container).width();
    var c_h = $(container).height();
    if (c_w > c_h && c_h != 0) {size = c_h;}
    else if (c_w > c_h && c_h == 0) {size = c_w;}
    else if (c_h > c_w && c_w != 0) {size = c_w;}
    else if (c_h > c_w && c_w == 0) {size = c_h;}
    else {size = 200;}
    fb.size = size;
  }
  fb.square = fb.size / 2;
  fb.radius = fb.square * 0.875;
  fb.wheel = $('.farbtastic .wheel', container).get(0);
  fb.linked = callback;

  // Store farbtastic style
  $('head').append(
    '<style> .farbtastic {position: relative;}\n'+
    '.farbtastic * {position: absolute; cursor: crosshair;}'+
    '.farbtastic, .farbtastic *{-webkit-user-select: none; -moz-user-select: none; -o-user-select: none; user-select: none;}\n'+
    '.farbtastic, .farbtastic .wheel {width: '+size+'px; height: '+size+'px;}\n'+
    '.farbtastic .color, .farbtastic .overlay {width: 50%; height: 50%; top: 25%; left: 25%;}\n'+
    '.farbtastic .wheel {border-radius: 50%; -webkit-mask: radial-gradient(transparent 53%, black calc(53% + 0.5px));\n'+
      'mask: radial-gradient(transparent 53%, black calc(53% + 0.5px)); overflow: hidden;}\n'+
    '.farbtastic .wheelBlock {position: relative; float: right; width: 50%; height: 50%; overflow: hidden;}\n'+
    '.farbtastic .wheelBlock > div {position: absolute; width: calc((100% / 3) + 100%); height: calc((100% / 3) + 100%);}\n'+
    '.farbtastic #wheelMask {position: absolute; width: 74.5%; height: 74.5%; top: 50%; left: 50%;\n'+
      'transform: translate(-50%,-50%); border-radius: 50%; background: white;}\n'+
    '.farbtastic #wheel-1 {left: 0; top: 0; background: -o-linear-gradient(-60deg, #F00, #FF0 , #0F0);\n'+
      'background: -moz-linear-gradient(-60deg, #F00, #FF0 , #0F0); background: -webkit-linear-gradient(-60deg, #F00, #FF0 , #0F0);\n'+
      'background: linear-gradient(150deg, #F00, #FF0 , #0F0);}\n'+
    '.farbtastic #wheel-2 {right: 0; top: 0; background: -o-linear-gradient(60deg, #00F, #F0F, #F00);\n'+
      'background: -moz-linear-gradient(60deg, #00F, #F0F, #F00); background: -webkit-linear-gradient(60deg, #00F, #F0F, #F00);\n'+
      'background: linear-gradient(30deg, #00F, #F0F, #F00);}\n'+
    '.farbtastic #wheel-3 {right: 0; bottom: 0; background: -o-linear-gradient(120deg, #0FF, #00F, #F0F);\n'+
      'background: -moz-linear-gradient(120deg, #0FF, #00F, #F0F); background: -webkit-linear-gradient(120deg, #0FF, #00F, #F0F);\n'+
      'background: linear-gradient(-30deg, #0FF, #00F, #F0F);}\n'+
    '.farbtastic #wheel-4 {left: 0; bottom: 0; background: -o-linear-gradient(-120deg, #FF0, #0F0, #0FF);\n'+
      'background: -moz-linear-gradient(-120deg, #FF0, #0F0, #0FF); background: -webkit-linear-gradient(-120deg, #FF0, #0F0, #0FF);\n'+
      'background: linear-gradient(-150deg, #FF0, #0F0, #0FF);}\n'+
    '.farbtastic #wheel-A, .farbtastic #wheel-B {position: absolute; height: 50%; width: 75%; left: 12.5%;\n'+
      '-webkit-mask: linear-gradient(to right, transparent, black, transparent);\n'+
      'mask: linear-gradient(to right, transparent, black, transparent);}\n'+
    '.farbtastic #wheel-C, .farbtastic #wheel-D {position: absolute; width: 50%; height: 50%; top: 25%;\n'+
      '-webkit-mask: linear-gradient(transparent, black, transparent);\n'+
      'mask: linear-gradient(transparent, black, transparent);}\n'+
    '.farbtastic #wheel-A {top: 0; background: -o-linear-gradient(left, #F0F, #F00, #FF0);\n'+
      'background: -moz-linear-gradient(left, #F0F, #F00, #FF0); background: -webkit-linear-gradient(left, #F0F, #F00, #FF0);\n'+
      'background: linear-gradient(to right, #F0F, #F00, #FF0);}\n'+
    '.farbtastic #wheel-B {bottom: 0; background: -o-linear-gradient(left, #00F, #0FF, #0F0);\n'+
      'background: -moz-linear-gradient(left, #00F, #0FF, #0F0); background: -webkit-linear-gradient(left, #00F, #0FF, #0F0);\n'+
      'background: linear-gradient(to right, #00F, #0FF, #0F0);}\n'+
    '.farbtastic #wheel-C {left: 0; background: -o-linear-gradient(#F0F, #00F);\n'+
      'background: -moz-linear-gradient(#F0F, #00F); background: -webkit-linear-gradient(#F0F, #00F);\n'+
      'background: linear-gradient(#F0F, #00F);}\n'+
    '.farbtastic #wheel-D {right: 0; background: -o-linear-gradient(#FF0, #0F0);\n'+
      'background: -moz-linear-gradient(#FF0, #0F0); background: -webkit-linear-gradient(#FF0, #0F0);\n'+
      'background: linear-gradient(#FF0, #0F0);}\n'+
    '.farbtastic .overlay {\n'+
      'background: -o-linear-gradient(right, #808080, rgba(128,128,128,0.6), rgba(128,128,128,0.25), rgba(128,128,128,0.05), transparent);\n'+
      'background: -moz-linear-gradient(right, #808080, rgba(128,128,128,0.6), rgba(128,128,128,0.25), rgba(128,128,128,0.05), transparent);\n'+
      'background: -webkit-linear-gradient(right, #808080, rgba(128,128,128,0.6), rgba(128,128,128,0.25), rgba(128,128,128,0.05), transparent);\n'+
      'background: linear-gradient(to left, #808080, rgba(128,128,128,0.6), rgba(128,128,128,0.25), rgba(128,128,128,0.05), transparent);}\n'+
    '.farbtastic .overlay > div {width: 100%; height: 100%;\n'+
      'background: -o-linear-gradient(white, rgba(255,255,255,0.58), rgba(255,255,255,0.23), rgba(255,255,255,0.03), transparent);\n'+
      'background: -moz-linear-gradient(white, rgba(255,255,255,0.58), rgba(255,255,255,0.23), rgba(255,255,255,0.03), transparent);\n'+
      'background: -webkit-linear-gradient(white, rgba(255,255,255,0.58), rgba(255,255,255,0.23), rgba(255,255,255,0.03), transparent);\n'+
      'background: linear-gradient(white, rgba(255,255,255,0.58), rgba(255,255,255,0.23), rgba(255,255,255,0.03), transparent);}\n'+
    '.farbtastic .overlay > div > div {width: 100%; height: 100%;\n'+
      'background: -o-linear-gradient(transparent, rgba(0,0,0,0.03), rgba(0,0,0,0.23), rgba(0,0,0,0.58), black);\n'+
      'background: -moz-linear-gradient(transparent, rgba(0,0,0,0.03), rgba(0,0,0,0.23), rgba(0,0,0,0.58), black);\n'+
      'background: -webkit-linear-gradient(transparent, rgba(0,0,0,0.03), rgba(0,0,0,0.23), rgba(0,0,0,0.58), black);\n'+
      'background: linear-gradient(transparent, rgba(0,0,0,0.03), rgba(0,0,0,0.23), rgba(0,0,0,0.58), black);}\n'+
    '.farbtastic .marker {width: '+(size*0.12)+'px; height: '+(size*0.12)+'px; margin: -'+(size*0.06)+'px 0 0 -'+(size*0.06)+'px; overflow: hidden;\n'+
      'background: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+DQogIDxjaXJjbGUgY'+
      '3g9IjgiIGN5PSI4IiByPSIwLjUiIHN0eWxlPSJmaWxsOiAjZmZmIi8+DQogIDxwYXRoIGQ9Ik04LDJhNiw2LDAsMSwwLDYsNkE2LDYsMCwwLDAsOCwyWk04LDEyYTQsNCwwLDEsMSw0L'+
      'TRBNCw0LDAsMCwxLDgsMTJaIi8+DQogIDxwYXRoIGQ9Ik04LDBhOCw4LDAsMSwwLDgsOEE4LDgsMCwwLDAsOCwwWk04LDE0YTYsNiwwLDEsMSw2LTZBNiw2LDAsMCwxLDgsMTRaIiBzd'+
      'HlsZT0iZmlsbDogI2ZmZiIvPg0KPC9zdmc+") no-repeat;} </style>'
  );


  /**
   * Link to the given element(s) or callback.
   */
  fb.linkTo = function (callback) {
    // Unbind previous nodes
    if (typeof fb.callback == 'object') {
      $(fb.callback).unbind('keyup', fb.updateValue);
    }

    // Reset color
    fb.color = null;

    // Bind callback or elements
    if (typeof callback == 'function') {
      fb.callback = callback;
    }
    else if (typeof callback == 'object' || typeof callback == 'string') {
      fb.callback = $(callback);
      fb.callback.bind('keyup', fb.updateValue);
      if (fb.callback.get(0).value) {
        fb.setColor(fb.callback.get(0).value);
      }
    }
    return this;
  }
  fb.updateValue = function (event) {
    if (this.value && this.value != fb.color) {
      fb.setColor(this.value);
    }
  }

  /**
   * Change color with Color Code "#123456" or HSL Code [0-1, 0-1, 0-1] or RGB Code [0-255, 0-255, 0-255]
   */
  fb.setColor = function (color) {
    if (typeof color == "object" && color.indexOf("#") == -1) {
      if (color[0] > 1 || color[1] > 1 || color[2] > 1) {
        fb.rgb = color;
        fb.hsl = fb.RGBToHSL(color);
      }
      else {
        fb.hsl = color;
        fb.rgb = fb.HSLToRGB(color);
      }
      fb.color = fb.pack(fb.rgb);
    }
    else {
      var unpack = fb.unpack(color);
      if (fb.color != color && unpack) {
        fb.color = color;
        fb.rgb = unpack;
        fb.hsl = fb.RGBToHSL(fb.rgb);
      }
    }
    fb.updateDisplay();
    return this;
  }

  /////////////////////////////////////////////////////

  /**
   * Retrieve the coordinates of the given event relative to the center
   * of the widget.
   */
  fb.widgetCoords = function (event) {
    var x, y;
    var el = event.target || event.srcElement;
    var reference = fb.wheel;

    if (typeof event.offsetX != 'undefined') {
      // Use offset coordinates and find common offsetParent
      var pos = { x: event.offsetX, y: event.offsetY };

      // Send the coordinates upwards through the offsetParent chain.
      var e = el;
      while (e) {
        e.mouseX = pos.x;
        e.mouseY = pos.y;
        pos.x += e.offsetLeft;
        pos.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Look for the coordinates starting from the wheel widget.
      var e = reference;
      var offset = { x: 0, y: 0 }
      while (e) {
        if (typeof e.mouseX != 'undefined') {
          x = e.mouseX - offset.x;
          y = e.mouseY - offset.y;
          break;
        }
        offset.x += e.offsetLeft;
        offset.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Reset stored coordinates
      e = el;
      while (e) {
        e.mouseX = undefined;
        e.mouseY = undefined;
        e = e.offsetParent;
      }
    }
    else {
      // Use absolute coordinates
      var pos = fb.absolutePosition(reference);
      x = (event.pageX || 0*(event.clientX + $('html').get(0).scrollLeft)) - pos.x;
      y = (event.pageY || 0*(event.clientY + $('html').get(0).scrollTop)) - pos.y;
    }
    // Subtract distance to middle
    return { x: x - fb.size / 2, y: y - fb.size / 2 };
  }

  /**
   * Mousedown handler
   */
  fb.mousedown = function (event) {
    // Capture mouse
    if (!document.dragging) {
      $(document).bind('mousemove', fb.mousemove).bind('mouseup', fb.mouseup);
      document.dragging = true;
    }

    // Check which area is being dragged
    var pos = fb.widgetCoords(event);
    fb.circleDrag = Math.max(Math.abs(pos.x), Math.abs(pos.y)) * 2 > fb.square;

    // Process
    fb.mousemove(event);
    return false;
  }

  /**
   * Mousemove handler
   */
  fb.mousemove = function (event) {
    // Get coordinates relative to color picker center
    var pos = fb.widgetCoords(event);

    // Set new HSL parameters
    if (fb.circleDrag) {
      var hue = Math.atan2(pos.x, -pos.y) / 6.28;
      if (hue < 0) hue += 1;
      fb.setColor([hue, fb.hsl[1], fb.hsl[2]]);
    }
    else {
      var sat = Math.max(0, Math.min(1, -(pos.x / fb.square) + .5));
      var lum = Math.max(0, Math.min(1, -(pos.y / fb.square) + .5));
      fb.setColor([fb.hsl[0], sat, lum]);
    }
    return false;
  }

  /**
   * Mouseup handler
   */
  fb.mouseup = function () {
    // Uncapture mouse
    $(document).unbind('mousemove', fb.mousemove);
    $(document).unbind('mouseup', fb.mouseup);
    document.dragging = false;
  }

  /**
   * Update the markers and styles
   */
  fb.updateDisplay = function () {
    // Markers
    var angle = fb.hsl[0] * 6.28;
    $('.h-marker', e).css({
      left: Math.round(Math.sin(angle) * fb.radius + fb.size / 2) + 'px',
      top: Math.round(-Math.cos(angle) * fb.radius + fb.size / 2) + 'px'
    });

    $('.sl-marker', e).css({
      left: Math.round(fb.square * (.5 - fb.hsl[1]) + fb.size / 2) + 'px',
      top: Math.round(fb.square * (.5 - fb.hsl[2]) + fb.size / 2) + 'px'
    });

    // Saturation/Luminance gradient
    $('.color', e).css('backgroundColor', fb.pack(fb.HSLToRGB([fb.hsl[0], 1, 0.5])));

    // Linked elements or callback
    if (typeof fb.callback == 'object') {
      // Set background/foreground color
      $(fb.callback).css({
        backgroundColor: fb.color,
        color: fb.hsl[2] > 0.5 ? '#000' : (isNaN(fb.hsl[2]) ? false : '#FFF')
      });

      // Change linked value
      $(fb.callback).each(function() {
        if (this.value && this.value != fb.color && fb.color.indexOf("NaNNaN") == -1) {
          this.value = fb.color;
        }
      });
    }
    else if (typeof fb.callback == 'function') {
      fb.callback.call(fb, fb.color);
    }
  }

  /**
   * Get absolute position of element
   */
  fb.absolutePosition = function (el) {
    var r = { x: el.offsetLeft, y: el.offsetTop };
    // Resolve relative to offsetParent
    if (el.offsetParent) {
      var tmp = fb.absolutePosition(el.offsetParent);
      r.x += tmp.x;
      r.y += tmp.y;
    }
    return r;
  };

  /* Various color utility functions */
  fb.pack = function (rgb) {
    var r = rgb[0], g = rgb[1], b = rgb[2];
    return '#' + (r < 16 ? '0' : '') + r.toString(16) +
           (g < 16 ? '0' : '') + g.toString(16) +
           (b < 16 ? '0' : '') + b.toString(16);
  }

  fb.unpack = function (color) {
    if (color.length == 7) {
      return [parseInt('0x' + color.substring(1, 3)) / 255,
        parseInt('0x' + color.substring(3, 5)) / 255,
        parseInt('0x' + color.substring(5, 7)) / 255];
    }
    else if (color.length == 4) {
      return [parseInt('0x' + color.substring(1, 2)) / 15,
        parseInt('0x' + color.substring(2, 3)) / 15,
        parseInt('0x' + color.substring(3, 4)) / 15];
    }
  }

  fb.HSLToRGB = function (hsl) {
    var m1, m2, h = hsl[0], s = hsl[1], l = hsl[2];
    m2 = (l <= 0.5) ? l * (s + 1) : l + s - l*s;
    m1 = l * 2 - m2;
    return [Math.round(this.hueToRGB(m1, m2, h+(1/3)) * 255),
        Math.round(this.hueToRGB(m1, m2, h) * 255),
        Math.round(this.hueToRGB(m1, m2, h-(1/3)) * 255)];
  }

  fb.hueToRGB = function (m1, m2, h) {
    h = (h < 0) ? h + 1 : ((h > 1) ? h - 1 : h);
    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (1 / 1.5 - h) * 6;
    return m1;
  }

  fb.RGBToHSL = function (rgb) {
    var min, max, delta, h, s, l;
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    min = Math.min(r, Math.min(g, b));
    max = Math.max(r, Math.max(g, b));
    delta = max - min;
    l = (min + max) / 2;
    s = 0;
    if (l > 0 && l < 1) {
      s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
    }
    h = 0;
    if (delta > 0) {
      if (max == r && max != g) h += (g - b) / delta;
      if (max == g && max != b) h += (2 + (b - r) / delta);
      if (max == b && max != r) h += (4 + (r - g) / delta);
      h /= 6;
    }
    return [h, s, l];
  }

  // Install mousedown handler (the others are set on the document on-demand)
  $('*', e).mousedown(fb.mousedown);

  // Init color
  fb.setColor('#000000');

  // Set linked elements/callback
  if (callback) {
    fb.linkTo(callback);
  }
};