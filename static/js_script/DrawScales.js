//根据Methods,colorscale，bins重绘制数据
function drawScale(Methods,scale_colormap,bins){
    //判断用那一个直方图特征绘制
    if (Methods == "Data feature") {
           HIST_DATA = hist_data;
           NEW_POS = hist_AnchorPos;
         } else {
           HIST_DATA = Boundary_hist_data;
           NEW_POS = Boundary_AnchorPos;
         }
   
         // 先生成Bins图
         DrawBins(bins, HIST_DATA, scale_colormap);
         //这里需要让绘制的直方图再显示
         $("#svg_body").css(
           {
             visibility: 'visible',
           }
         );
   
         //画出结果
         $(function () {
   
   
           var CS = document.getElementById("new_img"),
             ctx = CS.getContext("2d"),
             width = data[0].length,//宽度
             height = data.length,//高度
             imgData = ctx.createImageData(width, height);
   
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
             var width_scale = W / imgData.width;
             var height_scale = W * height / width / imgData.height;
   
           } else {
   
             $("#new_img_scale").attr("width", W);
             $("#new_img_scale").attr("height", W);
   
             $("#new_img_scale").css(
               {
                 width: $("#new_img_scale").attr("width"),
                 height: $("#new_img_scale").attr("height"),
   
               }
             )
             var width_scale = W / imgData.width;
             var height_scale = W / imgData.height;
   
           }
           //二维循环来遍历每一个像素
   
           for (var i = 0; i < height; i++)
             for (var j = 0; j < width; j++) {
               var p = i * width + j;
               var c = background_color
   
               if (data[i][j])
               {
                var Index = Math.floor(data[i][j] * 254);
                var c = scale_colormap[Index];
               }
   
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
         })
   
         //画颜色图
         $(function () {
   
           var CS = document.getElementById("new_colormap"),
             ctx = CS.getContext("2d"),
             imgData = ctx.createImageData(255, 1);
           for (var i = 0, j = 0; i < imgData.data.length; i += 4) {
             var c = scale_colormap[j];
             imgData.data[i + 0] = c[0];
             imgData.data[i + 1] = c[1];
             imgData.data[i + 2] = c[2];
             imgData.data[i + 3] = 255;
             j++;
           }
           ctx.putImageData(imgData, 0, 0);
           //设置样式
           $(" #new_colormap").css({
             "width": W,
             "height": "20px"
           })
         })
   
   
         //画select_colormap的颜色图
         $(function () {
   
           var CS = document.getElementById("select_colormap"),
             ctx = CS.getContext("2d"),
             imgData = ctx.createImageData(255, 1);
           for (var i = 0, j = 0; i < imgData.data.length; i += 4) {
             var c = scale_colormap[j];
             imgData.data[i + 0] = c[0];
             imgData.data[i + 1] = c[1];
             imgData.data[i + 2] = c[2];
             imgData.data[i + 3] = 255;
             j++;
           }
           ctx.putImageData(imgData, 0, 0);
   
         })
   
   }