import json
from flask import Flask,render_template,request,jsonify
import os
import numpy as np
from ctypes import *
import cv2
import math
# convert python list to c 1D array




def carray2pylist(array):
    list = []
    for i in range(array.shape[1]):
        list.append(array[0,i])
    return list


#获取数据的一阶导和二阶导
def to_getDvts(data, mask):
    paddingData=cv2.copyMakeBorder(data, 1, 1, 1, 1, cv2.BORDER_DEFAULT);
    paddingMask=cv2.copyMakeBorder(mask, 1, 1, 1, 1, cv2.BORDER_DEFAULT);
    #2. Compute gradient using central difference
    rawGrad=np.zeros([np.size(data,0),np.size(data,1)], np.float);
    for i in range(1,np.size(paddingData,0)-1):
       for j in range(1,np.size(paddingData,1)-1):
           if paddingMask[i,j]:
               xl=paddingData[i,j];
               xr=paddingData[i,j];
               yl=paddingData[i,j];
               yr=paddingData[i,j];
               
               if paddingMask[i,j-1]:
                   xl=paddingData[i,j-1];
               if paddingMask[i,j+1]:
                   xr=paddingData[i,j+1];
               if paddingMask[i-1,j]:
                   yl=paddingData[i-1,j];
               if paddingMask[i+1,j]:
                   yr=paddingData[i+1,j];    
                   
               gx=0.5*(xr-xl);
               gy=0.5*(yr-yl);
               
               rawGrad[i-1,j-1]=math.sqrt(gx*gx+gy*gy);
           else:
               rawGrad[i-1,j-1]=float("nan");
               
    #cv2.normalize(rawGrad,rawGrad,0,1,cv2.NORM_MINMAX,-1,mask);    
    
    #3. compute laplacian using difference between pixel and mean value of its four neighbors   
    rawLap=np.zeros([np.size(data,0),np.size(data,1)], np.float);
    for i in range(1,np.size(paddingData,0)-1):
       for j in range(1,np.size(paddingData,1)-1):
           if paddingMask[i,j]:
               sum=0;
               
               if paddingMask[i,j-1]:
                   sum+=paddingData[i,j-1];
               if paddingMask[i,j+1]:
                   sum+=paddingData[i,j+1];
               if paddingMask[i-1,j]:
                   sum+=paddingData[i-1,j];
               if paddingMask[i+1,j]:
                   sum+=paddingData[i+1,j];    
                   
               sum/=4;
               
               rawLap[i-1,j-1]=sum-paddingData[i,j];
           else:
               rawLap[i-1,j-1]=float("nan");
               
    #cv2.normalize(rawLap,rawLap,0,1,cv2.NORM_MINMAX,-1,mask); 
    return rawGrad, rawLap;
#根据一阶导和二阶导获取pv
def to_getPV(data,dataGrad,dataLap,mask,BIN_NUM=255,eta=0.01):
    row=data.shape[0];
    col=data.shape[1];


    dataIdx=np.int32(data*(BIN_NUM-1));#nan auto to be<0
    
    g=np.zeros([BIN_NUM,1], np.float);
    h=np.zeros([BIN_NUM,1], np.float);
    
    for i in range(BIN_NUM):
       index=np.argwhere(dataIdx==i);
       if np.size(index)!=0:#如果数组不是空的进行计算
           g_sum=0;
           h_sum=0;
           for j in range(index.shape[0]):
               index_x=index[j,0];
               index_y=index[j,1];
      
               g_sum+=dataGrad[index_x,index_y];
               h_sum+=dataLap[index_x,index_y];
            #算出平均   
           g_ave=g_sum/index.shape[0];
           h_ave=h_sum/index.shape[0];
          
           g[i,0]=g_ave;
           h[i,0]=h_ave;
    
    
    #计算delta
    maxGrad=cv2.minMaxLoc(dataGrad,mask)[1];
    maxLap=cv2.minMaxLoc(dataLap,mask)[1];

    #再归一化
    cv2.normalize(dataGrad,dataGrad,0,1,cv2.NORM_MINMAX,-1,mask);
    cv2.normalize(dataLap,dataLap,0,1,cv2.NORM_MINMAX,-1,mask);
    if maxLap==0:
        delta=0;
    else:
        delta=maxGrad/(maxLap*math.sqrt(math.exp(1)));
    
    #计算V
    v=np.zeros([BIN_NUM,1], np.float);
    for i in range(BIN_NUM):
        v[i,0]=10000;
        if abs(g[i,0])>=1e-10:
            v[i,0]=-delta*delta*h[i,0]/g[i,0];
    
    #Assign weight to each data
    w=np.zeros([row,col], np.float);
    for i in range(row):
        for j in range(col):
            index=dataIdx[i,j];
            if index>=0:
                w[i,j]=v[index,0];
            else:
                w[i,j]=float("nan");
                
    w=-eta*abs(w);       
    cv2.exp(w,w);        
    cv2.normalize(w,w,0,1,cv2.NORM_MINMAX,-1,mask);
    return w;
#计算新的优化点
def to_getPos(histData,histPos,bins):
    for i in range(1,bins):
        target=i/bins;#设置目标点
        #在hsitData中寻找目标点
        accum=0;
        for k in range(bins):
            accum+=histData[0,k];
            if accum>target:
                t=k*(1/bins);
                if t==0:#代表是在第一个bins内，k=0需要特殊处理
                    histPos[0,i]=t+target/histData[0,k]*(1/bins);
                else:#其它情况
                    X=target-(accum-histData[0,k]);
                    histPos[0,i]=t+X/histData[0,k]*(1/bins);
                break;
    histPos[0,bins]= 1;
    return histPos;

#计算最终结果
def to_getRes(orgdata,mask,bins):

    org_histPos=np.zeros([1,bins+1], np.float);#原始直方图位置数据
    new_histPos=np.zeros([1,bins+1], np.float);#boundary直方图位置数据
    org_histData=np.zeros([1,bins], np.float);#原始直方图统计数据
    new_histData=np.zeros([1,bins], np.float);#boundary直方图统计数据
    
    dataGrad,dataLap=to_getDvts(orgdata, mask);
    pv=to_getPV(orgdata,dataGrad,dataLap,mask);
    
    
    dataIdx=np.int32(orgdata*(bins-1));#nan auto to be<0
    
    
    for m in range(dataIdx.shape[0]):
        for n in range(dataIdx.shape[1]):
            if mask[m,n]:
                bins_index=dataIdx[m,n];
                org_histData[0,bins_index]=org_histData[0,bins_index]+1;
                new_histData[0,bins_index]=new_histData[0,bins_index]+pv[m,n];
    
    #对数据进行归一化
    org_histData=org_histData/cv2.sumElems(org_histData)[0];
    new_histData=new_histData/cv2.sumElems(new_histData)[0];
    #计算新的优化点
    org_histPos=to_getPos(org_histData,org_histPos,bins);     
    new_histPos=to_getPos(new_histData,new_histPos,bins);                     
    return  org_histPos,new_histPos, org_histData,new_histData;     


#hello world
#创建应用程序
#web应用程序
app=Flask(__name__)
#写一个函数来处理浏览器发送过来的请求
@app.route('/')
def getStart():
    path = './colormaps' #load colormaps
    files= os.listdir(path)
    colormap = {}
    for file in files:
        f = open(path+'/'+file)
        str = ''
        for line in f:
            odom = [float(i) for i in line.split()]
            str = str+ '%02x%02x%02x' % (int(odom[0]*255), int(odom[1]*255), int(odom[2]*255))+','
        str = str[:-1]#除了最后一个字符全部取出来
        colormap[os.path.splitext(file)[0]] = str#os.path.splitext(file)[0]取到文件名

    return render_template('demo.html', colormap=colormap)



@app.route('/generate_result',methods=['POST','GET'])
def generate():
    
    #获取Get数据
   
    dlist = json.loads(request.get_data(as_text=True))
    AnchorPos = dlist['AnchorPos']
    data=dlist['data']
    bins=dlist['bins']
    print(len(data))
    for i in range(len(data)):
         for j in range(len(data[0])):
             if data[i][j] == None:
                data[i][j] = float('nan')
     
    #先处理data
    
    data=np.array(data)
    
    mask=(data==data)
    mask=mask.astype(np.uint8)

    bins=np.int(bins)

    #计算优化点
    org_histPos,new_histPos, org_histData,new_histData=to_getRes(data,mask,bins)
    
    #返回数据需要重新转化成list
    res_org_HistPos = carray2pylist(org_histPos)
    res_new_HistPos = carray2pylist(new_histPos)
    res_org_COUNT_H = carray2pylist(org_histData)
    res_new_COUNT_H = carray2pylist(new_histData)
    
    return jsonify({
        "org_HistPos":res_org_HistPos,#这个是原始直方图
        "new_HistPos":res_new_HistPos,#这个是boundary计算的直方图数据
        "org_COUNT_H":res_org_COUNT_H,
        "new_COUNT_H":res_new_COUNT_H,
        })
    


if __name__=='__main__':#固定写法，程序的入口
    app.run(debug=True)#启动应用程序，启动一个flask项目
    #debug=True就不需要刷新服务器