//根据bins个数来画直方图
function DrawBins(bins, HIST_DATA, scale_colormap) {

    //先要移除svg元素，然后再创建svg
    var body = d3.select("#svg_body");
    //移除svg元素
    $("#hist").remove();
    var width = $("#svg_body").width();;
    var height = $("#svg_body").height();
    var svg = body.append("svg")
      .attr("id", "hist")
      .attr("width", width)
      .attr("height", height);
  
  
    var dataset = HIST_DATA;
    console.log(dataset);//测试数据输出
  
    var max = Math.max.apply(null, dataset);
    //var min = Math.min.apply(null, dataset);
  
    var top = max;
  
  
    //2.坐标轴
    var xScale = d3.scale.linear()
      .domain([0, bins])
      .range([0, width - 40]);
  
    var yScale = d3.scale.linear()
      .domain([top, 0])
      .range([0, height - 30]);
  
    var xAxis = d3.svg.axis()
      .scale(xScale)//比例尺
      .orient("bottom");//比例吃的方向
  
    var gxAxis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(30,190)")//平移参数
      .call(xAxis);//相当于把g作为参数传给xAxis；//xAxis(gxAxis)
  
    //添加y轴
    var yAxis = d3.svg.axis()
      .scale(yScale)//比例尺
      .orient("left");//比例吃的方向
  
    var gyAxis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(30,10)")
      .call(yAxis);//相当于把g作为参数传给xAxis；//xAxis(gxAxis)
  
    //画直方图
    yScale.domain([0, top]);//为了计算方便而修改回来
    var rects = svg.selectAll(".MyRect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "MyRect")
      .attr("id", function (d, i) {
        return i + 1;
      })
      .attr("transform", "translate(30,10)")//已经平移了
      .attr("x", function (d, i) {
        return xScale(i);
      })
      .attr("y", function (d) {
        return yScale(top - d);
      })
      .attr("width", function () {
        return (width - 40) / bins - 1;
      })
      .attr("height", function (d) {
        return yScale(d);
      }).attr("fill", "rgb(255,255,255)")
      .transition()
      .duration(1000)//过渡
      .attr("x", function (d, i) {
        return xScale(i);
      })
      .attr("y", function (d) {
        return yScale(top - d);
      })
      .attr("width", function () {
        return (width - 40) / bins - 1;
      })
      .attr("height", function (d) {
        return yScale(d);
      }).attr("fill", function (d, i) {
        if($.inArray(i+1, insert_Bins)!=-1)
        {
          var fill_c = `rgb(255,192,203)`;//pink颜色
        }else{
          var index=Math.floor((i / bins+1/bins*0.5)*254);
          var c = scale_colormap[index];
       
       //   var c = scale_colormap(i / bins+1/bins*0.5);
        var r = c[0];
        var g = c[1];
        var b = c[2];
        var fill_c = `rgb(${r},${g},${b})`;
        }
        return fill_c;//到时候需要修改
      })
      ;
  
  
      // $.each(insert_Bins, function () {
      //   console.log(this);
      //   //将选中的bins重新标记
      //   $(`#${this}`).attr({
      //     "fill": "pink"
      //   });
      // });
  
  
  }