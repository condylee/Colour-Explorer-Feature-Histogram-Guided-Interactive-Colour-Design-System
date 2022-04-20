//插入颜色片段的代码
function insert_ColorMap() {
  var colormap=[].concat(temp_colormp);
    //1:对插入的bins进行预处理
    index_Bins = [];
    start_end = [];
    start_end.push(insert_Bins[0]);//首索引
    for (let i = 1; i < insert_Bins.length; i++) {
      if (insert_Bins[i] != (insert_Bins[i - 1] + 1)) {
        start_end.push(insert_Bins[i - 1]);//尾索引
        index_Bins.push(start_end);
        start_end = [];//重新清空
        start_end.push(insert_Bins[i]);//首索引
      }
    }
    start_end.push(insert_Bins[insert_Bins.length - 1]);//尾索引
    index_Bins.push(start_end);

    if (index_Bins.length > 1)//表明不是连续的bins
    {
      $('#alert').html('Please select the <strong>continuous</strong> bins before insert colormap！');
      $("#alert").show();
    } else {//表明选择的是连续的bins
      $("#alert").fadeOut();
      //将提示退去
      var start_index = Math.floor((index_Bins[0][0] - 1) / bins * 254);
      var end_index = Math.floor(index_Bins[0][1] / bins * 254);
      var nums = end_index - start_index + 1;
     
      for (var i = 0; i < 255; i++) {
        if (i >= start_index && i < end_index) {
          var index = Math.floor((i - start_index) / nums * 254);
          var org_color=colormap[i];
          var new_color=rgb[index];
          var r=org_color[0]*(1-Hmymap)+new_color[0]*Hmymap;
          var g=org_color[1]*(1-Hmymap)+new_color[1]*Hmymap;
          var b=org_color[2]*(1-Hmymap)+new_color[2]*Hmymap;
          var new_rgb=[];
          new_rgb[0]=r;new_rgb[1]=g;new_rgb[2]=b;
          colormap[i]=new_rgb;
        } 
      }
      //根据新的rgbmap画数据
      draw_mapping(org_rgb);//画原始数据
      drawScale(Methods,colormap,bins);
      new_colormap=[].concat(colormap);//更新colormap
    }
  }



