
// 这里写的是画bins 和相应的slider控件

$(function () {
  var handle = $("#custom-handle");
  $("#slider").slider({
    orientation: "vertical",
    range: "min",
    min: 20,
    max: 50,
    value: 20,
    create: function () {
      handle.text($(this).slider("value"));

    },
    slide: function (event, ui) {
      handle.text(ui.value);
      bins = ui.value;
      //将insert_bins数据变成空
      insert_Bins = [];
      //再来画数据
      DrawAllData(bins);


    }
  });
  //harmony参数
  var handle_weight = $("#custom-handle-weight");
  $("#slider-weight").slider({
    orientation: "vertical",
    range: "min",
    min: 0,
    max: 100,
    value: 0,
    create: function () {
      harmony = ($(this).slider("value") / 100).toFixed(2);

      handle_weight.text(harmony);

    },
    slide: function (event, ui) {
      harmony = (ui.value / 100).toFixed(2);
      handle_weight.text(harmony);
      //获取插入的颜色
      var background_color = $("#callback").css("background-color");
      var rgb_string = background_color.slice(4);
      var rgb_color = rgb_string.split(",");//注意这里的数组是字符窜
      insert_Color[0] = parseInt(rgb_color[0]);
      insert_Color[1] = parseInt(rgb_color[1]);
      insert_Color[2] = parseInt(rgb_color[2]);
      //console.log(insert_Color);
      insertColor();
      temp_colormp = [].concat(new_colormap);
    }
  });

  //discriminability参数
  var handle_weight_discrim = $("#custom-handle-weight-discrim");
  $("#slider-weight-discrim").slider({
    orientation: "vertical",
    range: "min",
    min: 0,
    max: 100,
    value: 0,
    create: function () {
      Hmymap = ($(this).slider("value") / 100).toFixed(2);
      handle_weight_discrim.text(Hmymap);
    },
    slide: function (event, ui) {
      Hmymap = (ui.value / 100).toFixed(2);
      handle_weight_discrim.text(Hmymap);
      insert_ColorMap();
      temp_colormp_1 = [].concat(new_colormap);

    }
  });

});

// 这里写的是加载动画 

//opts 样式可从网站在线制作

var opts = {
  lines: 13, // 花瓣数目
  length: 20, // 花瓣长度
  width: 10, // 花瓣宽度
  radius: 30, // 花瓣距中心半径
  corners: 1, // 花瓣圆滑度 (0-1)
  rotate: 0, // 花瓣旋转角度
  direction: 1, // 花瓣旋转方向 1: 顺时针, -1: 逆时针
  color: '#000', // 花瓣颜色
  speed: 1, // 花瓣旋转速度
  trail: 60, // 花瓣旋转时的拖影(百分比)
  shadow: false, // 花瓣是否显示阴影
  hwaccel: false, //spinner 是否启用硬件加速及高速旋转            
  className: 'spinner', // spinner css 样式名称
  zIndex: 2e9, // spinner的z轴 (默认是2000000000)
  top: '25%', // spinner 相对父容器Top定位 单位 px
  left: '50%'// spinner 相对父容器Left定位 单位 px
};

var spinner = new Spinner(opts);//创建新的对象



