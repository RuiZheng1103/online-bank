<template>
<div class="contractContainer">

        <span  class="vertical" @click="setActiveItem('addConnect')" v-show="flag"><i class="fa fa-angle-double-right"></i><i class="fa fa-angle-double-right"></i>&nbsp;加&nbsp;入&nbsp;讨&nbsp;论&nbsp;<i class="fa fa-angle-double-right"></i><i class="fa fa-angle-double-right"></i></span>
        <span class="back" v-show="!flag" @click="setActiveItem('userContent')"><i class="fa fa-angle-double-left"></i><i class="fa fa-angle-double-left"></i>&nbsp;退&nbsp;出&nbsp;聊&nbsp;天&nbsp;<i class="fa fa-angle-double-left"></i><i class="fa fa-angle-double-left"></i></span>

        <div class="content">
             <el-carousel trigger="click" height="900px" :autoplay="false" arrow="never" ref="carousel">
        <el-carousel-item name="userContent" class="item1">
           <div >
                <p>
                <span class="user">{{contentForm.userName}}</span>
                <span>&nbsp;&nbsp;{{contentForm.role}}</span>
                </p>
		<p class="second">
			<span>发表时间：{{contentForm.beginTime | dateFormat}}</span>
		<span>&nbsp;&nbsp;截止时间：{{contentForm.endTime | dateFormat}}</span>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;点击次数：{{contentForm.count}}</span>
		</p>
                
                <hr></hr>
                <h1>{{contentForm.name}}</h1>

                <div class="subContent" v-html="contentForm.content"></div>
                
           </div>
        </el-carousel-item>
         <el-carousel-item name="addConnect"> 
          <div>
                <header>在线聊天当前人数为:{{count}}</header>
                <div class="msg-box" ref="msg-box">
                    <div v-for="(i,index) in list" :key="index" class="msg"
		   >
                    <div :class="i.userName==userName?'right':'left'">
                        <span class="start">{{i.userName}}:</span>
			  <span class="backs">{{i.msg}}</span>
                    </div>
                    </div>
                </div>
                <div class="input-box">
                    <input type="text" ref="sendMsg" v-model="contentText" @keyup.enter="sendText()"/>
                    <div class="btn" :class="{['btn-active']:contentText}" @click="sendText">发送</div>
                </div>
          </div>
        </el-carousel-item>
        
    </el-carousel>
        </div>
     
</div>
</template>
<script>
import axios from 'axios'
export default {
    data(){
        return{
            contentForm:{
            },
	    count:1,
            flag:true,
            ws:null,
   
            userName:this.$store.state.userName,
            list:[],//聊天记录数组
            contentText:'',
        }
    },
    created() {
     console.log(this.$route.query)
       
            
             this.contentForm=this.$route.query
       
        
    },

    methods:{
        getConnect(){

        },
        setActiveItem(name){
	console.log('yes')
            this.$refs.carousel.setActiveItem(name)
            this.flag=!this.flag
            if(name=='addConnect'){
                this.initWebSocket();
		
            }else{
                this.ws.close(undefined)
		this.list=[]
		
            }
        },
        //发送聊天信息
        sendText(){
            this.$refs["sendMsg"].focus()
            if(!this.contentText){
                return;
            }
            let params={
                cId:this.contentForm.id,
                userName:this.userName,
                msg:this.contentText,
		count:this.list.count,
		role:this.$store.state.role,

            }
            this.ws.send(JSON.stringify(params))
            this.contentText='';
            setTimeout(()=>{
                this.scrollBottm()
            },500)
	    console.log(this.count)
        },
        //滚动条到底部
        scrollBottm(){
            let el=this.$refs["msg-box"];
            el.scrollTop=el.scrollHeight;
        },
        //点击加入聊天创建websocket连接
        initWebSocket(){
	_this=this
            if(window.WebSocket){
	    var token=this.$store.state.token
                var serverHot=window.location.hostname;
                let cid=this.contentForm.id//房间号
                //填写本地IP地址 并且，此处的端口号要与后端配置一致8081
                var url='ws://'+serverHot+':8082'+'/groupChat/'+cid+'/'+this.userName
                let ws=new WebSocket(url);
                _this.ws=ws
		console.log(this.ws)
                _this.ws.onopen=function(e){
                    console.log(e)
                    console.log("服务器连接成功"+url)
                }
		_this.ws.onclose=function(e){
			console.log("服务器连接关闭")
		}
		_this.ws.onerror=function(e){
			console.log("服务器连接失败")
		}
                _this.ws.onmessage=function(e){
                    //接受服务器返回的数据
		    console.log(e)
                    let resData=JSON.parse(e.data)
		    console.log(resData)
		    _this.count = resData.count;
		    console.log(_this.count)
		    if(resData.msg!=''){
		    	 
			     _this.list.push(resData)
			 console.log(_this.list)
		    }
                    
                }
            }
        }
    }
}
</script>
<style lang="scss" scoped>
    .contractContainer{
        width:100%;
        position:relative;
        background-color:	#AAAAAA;
        .content{
            border:2px solid darkslategray;
            border-radius:30px;
           padding:20px 60px;
            background-color:white;
            width:900px;
            margin:auto;
           
        }
        .subContent{
            text-indent:2em;
        }
        h1{
                text-align: center;
        }
	.second{
		display: flex;
    justify-content: space-between;
	}
        .user{
            font-size:20px;
        }
        .vertical{
              -webkit-writing-mode: vertical-rl;//设置垂直字体
               writing-mode: vertical-rl;
               position:absolute;
               right:420px;
               top:50%;
               color: #263c52;
		 opacity: 0.7;
        }
        .vertical:hover{
            color:blue
        }
        .back{
             -webkit-writing-mode: vertical-rl;
               writing-mode: vertical-rl;
               position:absolute;
               left:420px;
               top:50%;
	        color: #263c52;
		 opacity: 0.7;
	      
        }
        .back:hover{
            color:blue;
        }
	header{
		    text-align: center;
		    background-color: #27a29d;
		    font-size: 22px;
		    padding: 10px 0 10px 0;
		    /* height: 100px; */
		    color: aliceblue;
	}
        .msg-box {
            position: absolute;
            height: calc(100% - 6.5rem);
            width: 100%;
	    border: 1px solid lightblue;
            overflow-y: scroll;
            .msg {
                   min-height: 2.5rem;
    margin: 1rem 0.5rem;
    position: relative;
    display: flex;
    justify-content: flex-start !important;
            }
            .left {
	     position: absolute;
	    left: 0;
	    height: fit-content;
	    width: 50%;
	    border-radius: 20px;
	    display: flex;
	    justify-content: flex-end;
	    align-items: center;
	    color: black;
	    animation: toright 0.5s ease both 1;
            }
            .right {

	    position: absolute;
	    right: 0;
	    height: fit-content;
	    width: 50%;
	    border-radius: 20px;
	    display: flex;
	    justify-content: flex-end;
	    align-items: center;
	    color: black;
	    animation: toright 0.5s ease both 1;
            }
	    .start{
	        word-break: keep-all;
		    min-width: 50px;
	    }
             .backs{
		    background: bisque;
    min-width: 250px;
    border-radius: 20px;
    padding-left: 20px;
	     }
            
             
        }
        .input-box {
            padding: 0 0.5rem;
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 3.5rem;
            background: #27a29d;
            box-shadow: 0 0 5px #ccc;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .btn {
               height: 2.3rem;
		    /* min-width: 4rem; */
		    width: 100px;
		    background: white;
		    font-size: 0.88rem;
		    color: #1f1d1d;
		    text-align: center;
		    border-radius: 0.2rem;
		    margin-left: 0.5rem;
		    margin-right: 10px;
		    /* padding-top: 10px; */
		    padding: 0.5em;
		    /* padding-bottom: 5px; */
		    transition: 0.5s;

            }
	    
            .btn-hover {
                    background: #409eff;
                }
        }
    }
</style>