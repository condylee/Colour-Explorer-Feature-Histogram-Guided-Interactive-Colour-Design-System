//根据bins来绘制新的直方图和相应数据
function DrawAllData(bins) {
    //#region 
  
    //最后需要判断选择了那一个按钮，是feature还是data—hist,找出画直方图的方式
    if ($("#Boundary-feature")[0].checked == true)//注意这里面是false才会生效
    {
      Methods = "Boundary feature";
    }
    if ($("#Data-feature")[0].checked == true) {
      Methods = "Data feature";
    }
  
    // 处理数据阶段
    hist_AnchorPos = [];
    Boundary_AnchorPos = [];
    hist_data = [];
    Boundary_hist_data = [];
  
    //step one:根据选择的bins获取初始位置
    AnchorColor = [];//先清空，再放值
    AnchorPos = [];
    for (var i = 0; i <= bins; i++) {
      var value = i / bins;
      var index = Math.floor(254 * i / bins);
      //console.log(value,index)
      AnchorPos.push(value);
      AnchorColor.push(org_rgb[index]);//这个地方该不该除以255
    }
    //console.log(AnchorColor);
  
    //以上的数据需要传到C++里面，然后再根据c++返回的数据绘制colormap
  
    let send = {
      "data": data,//传入归一化的data
      "AnchorPos": AnchorPos,//传入初始位置
      "bins": bins,//传入选择的bins     
    }
    $.ajax({
      url: '/generate_result',
      type: 'post',
      dataType: 'json',
      headers: {
        "Content-Type": "application/json;charset=utf-8"
      },
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(send),
      beforeSend: function () {//发送数据前开始加载动画
        $("#loading-new").css(//加载动画区显示
          {
            display: "block",
          }),
          $("#new_block").css(//数据显示区隐藏
            {
              display: "none",
            }
          )
        var new_loading = $("#loading-new").get(0);
        spinner.spin(new_loading);
      },
      success: function (result) {
        //获取返回的数据
        hist_AnchorPos = result.org_HistPos;
        Boundary_AnchorPos = result.new_HistPos;
        hist_data = result.org_COUNT_H;
        Boundary_hist_data = result.new_COUNT_H;
  
        // console.log(hist_AnchorPos);
        // console.log(Boundary_AnchorPos);
        // console.log(hist_data);
        // console.log(Boundary_hist_data);
  
        
  
  
  
        //根据返回的数据绘制colormap和相应的颜色图
  //判断用那一个直方图特征绘制
  if (Methods == "Data feature") {
          HIST_DATA = hist_data;
          NEW_POS = hist_AnchorPos;
        } else {
          HIST_DATA = Boundary_hist_data;
          NEW_POS = Boundary_AnchorPos;
        }
  
        //根据位置进行颜色插值
        ColorScale = d3.scale.linear()//果然可以传入数组
          .domain(NEW_POS)//注意这的数值范围是0-1
          .range(AnchorColor);


          
          CS_to_ColorMap(ColorScale);//将scale转换成数组，更新new_colormap,所以这里的colorscale始终是优化后的colorscale
          temp_colormp_1=[].concat(new_colormap);//初始化锁定的colormap
          temp_colormp=[].concat(new_colormap);
        drawScale(Methods,new_colormap,bins);
       
        

        


  
      },
      complete: function () {
        //完成后加载动画停止
        spinner.spin();//加载动画停止
        $("#loading-new").css(
          {
            display: "none",
          }),
          $("#new_block").css(
            {
              display: "block",
            }
          )
      },
      error: function (msg) {
        alert(msg);
      }
    })
    //#endregion
  
  }