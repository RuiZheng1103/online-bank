<template>
   <div class="container">
       <div class="main">
           <div class="search">
                    <span> <el-select
                                v-model="fundName"
                                filterable
                                remote
                                clearable
                                placeholder="请输入基金名称"
                                :remote-method="remoteMethod"
                                :loading="loading">
                                <el-option
                                v-for="(item,i) in options"
                                :key="i"
                                :value="item.fundName">
                                </el-option>
                            </el-select>
                    </span>
                    <span><el-button type="info" icon="el-icon-search" @click="getFund">搜索</el-button></span>
                </div>
                <div class="content">
                      <el-table
                      :data="this.fundData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
                            stripe
                            :default-sort = "{prop: 'date', order: 'descending'}">
                            <el-table-column
                                prop="code"
                                label="代码">
                                 <template slot-scope="scope">
                                <div>{{scope.row.code}}</div>           
                                 </template>
                            </el-table-column>
                            <el-table-column
                                prop="fundName"
                                label="基金名称">
                                 <template slot-scope="scope">
                                <div>{{scope.row.fundName}}</div>           
                                 </template>
                            </el-table-column>
                            <el-table-column
                                prop="rateYear"
                                label="近一年收益率">
                                 <template slot-scope="scope">
                                <div>{{scope.row.rateYear}}</div>           
                                 </template>
                            </el-table-column>
                            <el-table-column
                                prop="currency"
                                label="币种">
                                 <template slot-scope="scope">
                                <div>{{scope.row.currency | current}}</div>           
                                 </template>
                            </el-table-column>   
                             <el-table-column
                                prop="kind"
                                label="基金种类">
                                 <template slot-scope="scope">
                                <div>{{scope.row.kind}}</div>           
                                 </template>
                            </el-table-column>   
                             <el-table-column
                                prop="type"
                                label="基金类型">
                                 <template slot-scope="scope">
                                <div>{{scope.row.type}}</div>           
                                 </template>
                            </el-table-column>   
                             <el-table-column
                                prop="beginTime"
                                label="起始时间"
                                width="250" >
                                <template slot-scope="scope">
                                <div>{{scope.row.beginTime | dateFormat}}</div>           
                                 </template>
                            </el-table-column>   
                             <el-table-column
                                prop="beginMoney"
                                label="起价">
                                <template slot-scope="scope">
                                <div>{{scope.row.beginMoney}}</div>           
                                 </template>
                            </el-table-column>
                             <el-table-column
                                prop="fundDayWorth"
                                label="昨日净价">
                                <template slot-scope="scope">
                                <div>{{scope.row.fundDayWorth}}</div>            
                                </template> 
                            </el-table-column>
                             <el-table-column
                                prop="worthDate"
                                label="昨日净价日期"
                                width="250">
                                <template slot-scope="scope">
                                <div>{{scope.row.worthDate | dateFormat}}</div>            
                                </template> 
                            </el-table-column>
                             <el-table-column
                                prop="status"
                                label="状态">
                                <template slot-scope="scope">
                                <div >{{scope.row.status | status}}</div>            
                                </template> 
                            </el-table-column>    
                             <el-table-column
                                    prop="handle"
                                    label="操作">
                                    <template slot-scope="scope">
                                    <el-button type="success"  @click="payevent(scope.row)">购买</el-button>
                                     </template> 
                                </el-table-column>                     
                            </el-table>
                </div>
                <el-pagination
                        background
                        layout="prev, pager, next"
                        :total="total"
                        @current-change="current_change">
                    </el-pagination>
       </div>
        <el-dialog title="购买" :visible.sync="dialogForm" width="30%">
                <el-form :model="fundForm" :rules="fundRules"  ref="fundForm">
                    <el-form-item label="基金名称" :label-width="formLabelWidth" prop="fundName">
                    <el-input v-model="fundForm.fundName" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="买入" :label-width="formLabelWidth" prop="money">
                         <el-input v-model="fundForm.money" autocomplete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="付款卡号" :label-width="formLabelWidth" prop="creditCard">
                     <el-select v-model="fundForm.creditCard" placeholder="请选择">
                        <el-option
                            v-for="(item,i) in creditCard"
                            :key="i"
                            :label="item.label"
                            :value="item">
                        </el-option>
                    </el-select>
                    </el-form-item>
                     
                </el-form>
                 <div slot="footer" class="dialog-footer">
                          <el-button @click="resetForm('fundForm')">取 消</el-button>
                        <el-button type="primary" @click="buyFund('fundForm')">确定</el-button>
                </div>
               
                   

        </el-dialog>
       
   </div>
</template>
<script>
import axios from 'axios'
export default {
    data(){
        var moneyCheck=(rule, value, callback)=>{
            if(value === ''){
                  return callback(new Error('买入多少'))
            }else if(isNaN(Number(value))){
                return callback(new Error('必须是数字'))
            }else if(Number(value)<Number(this.startMoney)){
                 return callback(new Error('买入必须大于起价'))
            } else {
                callback()
            }
        };
        return{
            formLabelWidth:"120px",
            creditCard:[],
            loading:false,
            fundAllData:[],
            fundData:[],
            fundName:'',
            options:[],
            currentPage:1,
            pagesize:10,
            total:1000,
            dialogForm:false,
            startMoney:'',
            fundForm:{
                id:'',
                fundName:'',
                money:'',
                creditCard:''
            },
            fundRules:{
              fundName:[{ required: true, message: '请输入基金名称', trigger: 'blur' }],
              money:[{ validator: moneyCheck, trigger: 'blur' }],
              creditCard:[{ required: true, message: '请选择付款卡号', trigger: 'blur' }],
            }
        }
    },
    created(){
       this.getFundData();

    },
    methods:{
        resetForm(fundForm){
                this.dialogForm=false;
                this.$refs[fundForm].resetFields();
        },
        payevent(row){
            this.startMoney=row.beginMoney
            this.fundForm.id=row.id
            this.fundForm.fundName=row.fundName
            this.creditCard=this.$store.state.creditCard
            this.dialogForm=true
        },
        buyFund(fundForm){
             this.$refs[fundForm].validate((valid) => {
            if (valid) {  
                axios.post('/in/saveFund',this.fundForm).then(result=>{
		 console.log(result)
                    if(result.code==200){
                        this.$message({
                        showClose: true,
                        message: result.msg,
                        type: 'success'
                        });
                        }else{
                            this.$message({
                            showClose: true,
                            message: result.msg,
                            type: 'error'
                            });
                        }
                    },error=>{})
           this.resetForm('fundForm')
          } else {
            console.log('error submit!!');
            return false;
          }
        });
        },
        current_change(currentPage){
            this.currentPage=currentPage
        },
        getFundData(){
            axios.get('/in/findFund').then(result=>{
                console.log(result)
                
                if(result.code==200){
                    this.fundAllData=result.data
                    this.fundData=this.fundAllData
                    this.total=this.fundData.length/this.pagesize*10;
                }
                
            },error=>{})
        },
        getFund(){
            if(!this.fundName==''){
                this.fundData=this.fundAllData.filter(item=>{
                    if(item.fundName==this.fundName){
                        return item
                    }
                })
            }else{
               this.fundData=this.fundAllData
            }
        },
         remoteMethod(query) {
            if (query !== '') {
            this.loading = true;
             setTimeout(() => {
                this.loading = false;
                this.options = this.fundAllData.filter(item => {
                    if(item.fundName.includes(query)){      
                        return item
                    }
                
                });
              }, 200);
            } else {
                 this.options = [];
            }
      }
    },
    filters:{
        current:function(params){
            if(params==0){
                return '人民币'
            }else{
                return '其他'
            }
        },
        status:function(params){
            if(params==0){
                return '正常'
            }else{
                return '不正常'
            }
        }
    }
       
}
</script>
<style lang="scss" scoped>
* /deep/ .el-table td, .el-table th {
    padding: 12px 0;
    min-width: 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    text-overflow: ellipsis;
    vertical-align: middle;
    position: relative;
    text-align: center;
}
* /deep/ .el-input {
    position: relative;
    font-size: 14px;
    display: inline-block;
    width: 100%;
    margin-right: 30px;
}
.container{
    width:100%;
    height:100%;

     .search{
        width:500px;
        display: flex;

    }
    .main{
        width:100%;
    }
}
</style>