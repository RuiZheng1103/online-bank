import axios from 'axios';
import router from '../src/router.js'
import store from '../src/store/index.js'
let loadingInstance; //创建Loading 的实例
// axios.defaults.baseURL = "https://localhost:8081/"; // 配置axios请求的地址
axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.crossDomain = true;
axios.defaults.withCredentials = true;  //设置cross跨域 并设置访问权限 允许跨域携带cookie信息
axios.defaults.headers.common['token'] = '';// 设置请求头为 Authorization
// request 请求拦截器

var inter=axios.interceptors.request.use(
    
    config => {
      console.log(config)
          if(config.url!="/in/login"&&!config.url!="/in/login"){
		  console.log("进来了")
              // 发送请求时携带token
              if (store.state.token!='') {
                config.headers.token = store.state.token
					 console.log(config)
              } else {
                // 重定向到登录页面
                router.push('/nohome/login')
              }
          }
         
     
      
      return config
    },
    error => {

      // 请求发生错误时
      console.log('request:', error)
      return Promise.reject(error) // 在调用的那边可以拿到(catch)你想返回的错误信息
    }
  )
  
  // response 响应拦截器
 var res=axios.interceptors.response.use(
    response => {
      return response.data
    },
    err => {
      console.log(err)
      if (err && err.response) {
        switch (err.response.status) {
          case 400:
            err.message = '请求错误'
            break
          case 401:
            err.message = '未授权，请登录'
            break
          case 403:
            err.message = '拒绝访问'
            break
          case 404:
            err.message = `请求地址出错: ${err.response.config.url}`
            break
          case 408:
            err.message = '请求超时'
            break
          case 500:
            err.message = '服务器内部错误'
            break
          case 501:
            err.message = '服务未实现'
            break
          case 502:
            err.message = '网关错误'
            break
          case 503:
            err.message = '服务不可用'
            break
          case 504:
            err.message = '网关超时'
            break
          case 505:
            err.message = 'HTTP版本不受支持'
            break
          default:
        }
      }
      return Promise.reject(err) // 返回接口返回的错误信息
    }
  )

export default axios