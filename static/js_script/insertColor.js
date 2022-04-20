//根据选择的颜色在颜色图中插入颜色
function insertColor( ) {//这里传入的colormap是锁定的colormap
   var colormap=[].concat(temp_colormp_1);//这里面放的是中间态的colormap);//这里面不能直接赋值否则会指向同一个元素地址
    
    if (insert_Bins.length != 0) {

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

        //2:根据index_Bins插入颜色生成新的colormap
        //2.1根据bins和colormap数组生成对应的颜色点
        for (var i = 0; i < index_Bins.length; i++) {
            var start_index = Math.floor(((index_Bins[i][0] - 1) / bins) * 254);
            var end_index = Math.floor((index_Bins[i][1] / bins) * 254);

            //1：这里是直接跟每一个color进行融合
            // for (var j = start_index; j <= end_index; j++) {//对每一个不同的bins段进行融合
            //     var r = colormap[j][0];
            //     var g = colormap[j][1];
            //     var b = colormap[j][2];
            //     var new_color=[];
            //     new_color[0]=r*(1-harmony)+insert_Color[0]*harmony;
            //     new_color[1]=g*(1-harmony)+insert_Color[1]*harmony;
            //     new_color[2]=b*(1-harmony)+insert_Color[2]*harmony;
            //     colormap[j]=new_color;
            // }

            //2：改在中间进行颜色的插值
            var middle_index=Math.floor((start_index+end_index)/2);
            var start_color=colormap[start_index];
            var end_color=colormap[end_index];
            //这里需要计算与中间颜色的融合
            var middle_color=[];
            middle_color[0]=colormap[middle_index][0]*(1-harmony)+insert_Color[0]*harmony;
            middle_color[1]=colormap[middle_index][1]*(1-harmony)+insert_Color[1]*harmony;
            middle_color[2]=colormap[middle_index][2]*(1-harmony)+insert_Color[2]*harmony;
            
            var position=[ ];
            var insert_colormap=[];
            insert_colormap.push(start_color);
            insert_colormap.push(middle_color);
            insert_colormap.push(end_color);
            position.push(start_index);
            position.push(middle_index);
            position.push(end_index);
            insert_colorscle = d3.scale.linear()//果然可以传入数组
          .domain(position)//注意这的数值范围是0-1
          .range(insert_colormap);
          for (var j = start_index; j <= end_index; j++) {//对每一个不同的bins段进行融合
            var c=insert_colorscle(j);
                var r = c[0];
                var g = c[1];
                var b = c[2];
                var new_color=[];
                new_color[0]=r;
                new_color[1]=g;
                new_color[2]=b;
                colormap[j]=new_color;
            }




        }
        new_colormap=[].concat(colormap);//不断更新new_colormap
        draw_mapping(rgb);//画原始数据
        drawScale(Methods,colormap,bins);

    }
}