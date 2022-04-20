 
//这里写的是基本的函数


  //将字符串数据变成数组
  function processData(data) {
    let temp_res = [];
    data = data.split('\n');

    for (var i = data.length - 1; i >= 0; i--) {

      let temp = [];
      data[i] = data[i].split(/[\s]+/);
      if (data[i].length > 1) {
        data[i].forEach(i => {
          if (new Decimal(i).toNumber() > max) {
            max = new Decimal(i).toNumber();
          }
          if (new Decimal(i).toNumber() < min) {
            min = new Decimal(i).toNumber();
          }
          temp.push(new Decimal(i).toNumber());
        })
        temp_res.unshift(temp);
      }
    }

    return temp_res;
  }


  //转换参数(将选中的colormap转换成rgb，lab)
  function transContent() {

    content.split(',').forEach((item, index) => {
      if (index != 254) {
        rgb_colormap.push([String(index / 255), hex2rgb(item)[0]]);
        lab.push(rgb2lab(hex2rgb(item)[1]));
        rgb.push(hex2rgb(item)[1]);
      } else {
        rgb_colormap.push(['1', hex2rgb(item)[0]]);
        lab.push(rgb2lab(hex2rgb(item)[1]));
        rgb.push(hex2rgb(item)[1]);
      }
    })

  }
//#endregion

  //#region 转化函数(从16进制转换成数字，再从数字转换成rgb——lab)
  function hex2rgb(hex) {
    let color = [],
      rgb = [];
    hex = hex.replace(/#/, "");

    if (hex.length == 3) { // 处理 "#abc" 成 "#aabbcc"
      let tmp = [];
      for (let i = 0; i < 3; i++) {
        tmp.push(hex.charAt(i) + hex.charAt(i));
      }
      hex = tmp.join("");
    }

    for (let i = 0; i < 3; i++) {
      color[i] = "0x" + hex.substr(i * 2, 2);
      rgb.push(parseInt(Number(color[i])));
    }
    return ["rgb(" + rgb.join(",") + ")", rgb];
  };

  function rgb2lab(rgb) {
    var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      x, y, z;

    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
    y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
    z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;

    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
  }

  function lab2rgb(lab) {
    var y = (lab[0] + 16) / 116,
      x = lab[1] / 500 + y,
      z = y - lab[2] / 200,
      r, g, b;

    x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16 / 116) / 7.787);
    y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16 / 116) / 7.787);
    z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16 / 116) / 7.787);

    r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    b = x * 0.0557 + y * -0.2040 + z * 1.0570;

    r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1 / 2.4) - 0.055) : 12.92 * r;
    g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1 / 2.4) - 0.055) : 12.92 * g;
    b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1 / 2.4) - 0.055) : 12.92 * b;

    return [Math.max(0, Math.min(1, r)) * 255,
    Math.max(0, Math.min(1, g)) * 255,
    Math.max(0, Math.min(1, b)) * 255]
  }
  //#endregion



//这里面传入的是255x3的colormap,画原始数据
  function draw_mapping(colormap){
      var CS = document.getElementById("org_img"),
        ctx = CS.getContext("2d"),
        width = data[0].length,//宽度
        height = data.length,//高度
        imgData = ctx.createImageData(width, height);
      //console.log(width,height,imgData.data.length);
      if (width > height) {
        $("#org_img_scale").attr("width", W);
        $("#org_img_scale").attr("height", W * height / width);

        $("#org_img_scale").css(
          {
            width: $("#org_img_scale").attr("width"),
            height: $("#org_img_scale").attr("height"),
            "margin-top": (W - W * height / width) / 2
          }
        )
        //这里是用来计算缩放的大小
        var width_scale = W / imgData.width;
        var height_scale = W * height / width / imgData.height;
      }
      else//高度大于宽度
      {
        $("#org_img_scale").attr("width", W);
        $("#org_img_scale").attr("height", W);
        $("#org_img_scale").css(
          {
            width: $("#org_img_scale").attr("width"),
            height: $("#org_img_scale").attr("height"),
          }
        )
        //这里是用来计算缩放的大小
        var width_scale = W / imgData.width;
        var height_scale = W / imgData.height;
      }

      //二维循环来遍历每一个像素

      for (var i = 0; i < height; i++)
        for (var j = 0; j < width; j++) {
          var p = i * width + j;
          var Index = Math.floor(data[i][j] * 254);
          var c = colormap[Index];
          if (!Index) c = background_color;
          // console.log(c);
          imgData.data[4 * p + 0] = c[0];
          imgData.data[4 * p + 1] = c[1];
          imgData.data[4 * p + 2] = c[2];
          imgData.data[4 * p + 3] = 255;//a对象的赋值

        }
      //ctx.putImageData(imgData, 0, 0);

      var destCtx = $("#org_img_scale")[0].getContext("2d");
      var newCanvas = $("<canvas>")
        .attr("width", imgData.width)
        .attr("height", imgData.height)[0];
      newCanvas.getContext("2d").putImageData(imgData, 0, 0);
      console.log(width_scale, height_scale);
      destCtx.scale(width_scale, height_scale);
      destCtx.drawImage(newCanvas, 0, 0);

    //画颜色图
  
      var CS = document.getElementById("org_colormap"),
        ctx = CS.getContext("2d"),
        imgData = ctx.createImageData(255, 1);
      for (var i = 0, j = 0; i < imgData.data.length; i += 4) {
        imgData.data[i + 0] = colormap[j][0];
        imgData.data[i + 1] = colormap[j][1];
        imgData.data[i + 2] = colormap[j][2];
        imgData.data[i + 3] = 255;
        j++;
      }
      ctx.putImageData(imgData, 0, 0);

   
   
  }


//这里面传入的是255x3的colormap,画新的原始数据
function draw_new_mapping(colormap){
  var CS = document.getElementById("new_img"),
    ctx = CS.getContext("2d"),
    width = data[0].length,//宽度
    height = data.length,//高度
    imgData = ctx.createImageData(width, height);
  //console.log(width,height,imgData.data.length);
  if (width > height) {
    $("#new_img_scale").attr("width", W);
    $("#new_img_scale").attr("height", W * height / width);

    $("#new_img_scale").css(
      {
        width: $("#new_img_scale").attr("width"),
        height: $("#new_img_scale").attr("height"),
        "margin-top": (W - W * height / width) / 2
      }
    )
    //这里是用来计算缩放的大小
    var width_scale = W / imgData.width;
    var height_scale = W * height / width / imgData.height;
  }
  else//高度大于宽度
  {
    $("#new_img_scale").attr("width", W);
    $("#new_img_scale").attr("height", W);
    $("#new_img_scale").css(
      {
        width: $("#new_img_scale").attr("width"),
        height: $("#new_img_scale").attr("height"),
      }
    )
    //这里是用来计算缩放的大小
    var width_scale = W / imgData.width;
    var height_scale = W / imgData.height;
  }

  //二维循环来遍历每一个像素

  for (var i = 0; i < height; i++)
    for (var j = 0; j < width; j++) {
      var p = i * width + j;
      var Index = Math.floor(data[i][j] * 254);
      var c = colormap[Index];
      if (!Index) c = background_color;
      // console.log(c);
      imgData.data[4 * p + 0] = c[0];
      imgData.data[4 * p + 1] = c[1];
      imgData.data[4 * p + 2] = c[2];
      imgData.data[4 * p + 3] = 255;//a对象的赋值

    }
  //ctx.putImageData(imgData, 0, 0);

  var destCtx = $("#new_img_scale")[0].getContext("2d");
  var newCanvas = $("<canvas>")
    .attr("width", imgData.width)
    .attr("height", imgData.height)[0];
  newCanvas.getContext("2d").putImageData(imgData, 0, 0);
  console.log(width_scale, height_scale);
  destCtx.scale(width_scale, height_scale);
  destCtx.drawImage(newCanvas, 0, 0);

//画颜色图

  var CS = document.getElementById("new_colormap"),
    ctx = CS.getContext("2d"),
    imgData = ctx.createImageData(255, 1);
  for (var i = 0, j = 0; i < imgData.data.length; i += 4) {
    imgData.data[i + 0] = colormap[j][0];
    imgData.data[i + 1] = colormap[j][1];
    imgData.data[i + 2] = colormap[j][2];
    imgData.data[i + 3] = 255;
    j++;
  }
  ctx.putImageData(imgData, 0, 0);



}




//将colorscale转换成3x255的colormap数组
function CS_to_ColorMap(CS){
  new_colormap=[];
  for( var i=0;i<255;i++)
  {
    var c = CS(i / 254);
          //这里就需要重新赋值，很奇怪
          var r = c[0];
          var g = c[1];
          var b = c[2];
          var color_rgb = [];
          color_rgb[0] = r;
          color_rgb[1] = g;
          color_rgb[2] = b;
          new_colormap.push(color_rgb);
  }

}


//将colorscale转换成3x255的colormap数组
function Draw_Colormap(colormap,name_id){
  var CS = document.getElementById(name_id),
  ctx = CS.getContext("2d"),
  imgData = ctx.createImageData(255, 1);
for (var i = 0, j = 0; i < imgData.data.length; i += 4) {
  imgData.data[i + 0] = colormap[j][0];
  imgData.data[i + 1] = colormap[j][1];
  imgData.data[i + 2] = colormap[j][2];
  imgData.data[i + 3] = 255;
  j++;
}
ctx.putImageData(imgData, 0, 0);

}