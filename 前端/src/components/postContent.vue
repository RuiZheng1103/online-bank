<template>
      <div class="contentsContainer">
         <el-form ref="infoForm" :model="infoForm" :rules="rules" label-width="100px" :hide-required-asterisk="true">
                <el-form-item label="标题" prop="a_title"  >
                    <el-input v-model="infoForm.name"></el-input>
                </el-form-item>

                <el-form-item label="主题图片" prop="a_imageUrl" >
                    <el-upload
                        class="uploader"
                        action="/in/upload"
                        :show-file-list="false"
                        :on-success="handleAvatarSuccess"
			multiple
                        :before-upload="beforeAvatarUpload">
                        <img v-if="infoForm.a_imageUrl" :src="infoForm.a_imageUrl" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        </el-upload>
                </el-form-item>
                <el-form-item label="详细" class="contentForm" prop="content">
                <!-- 图片上传组件辅助-->
                        <el-upload
                            class="avatar-uploader"
                            :action="serverUrl"
                            name="img"
                            :show-file-list="false"
                            :on-success="uploadSuccess"
                            :on-error="uploadError"
                            :before-upload="beforeUpload"
                            v-show="false">
                        </el-upload>

                        <quill-editor 
                        class="editor"
                        v-model="infoForm.content"
                        ref="myQuillEditor" 
                        :options="editorOption" 
                        @blur="onEditorBlur($event)" @focus="onEditorFocus($event)"
                        @change="onEditorChange($event)">
                        </quill-editor>
                </el-form-item>
              <el-form-item class="endForm">
                  <el-button type="primary" @click="cancel">取消</el-button>
                 <el-button class="button" type="primary" @click="onSubmit('infoForm')">确认提交</el-button>
              </el-form-item>
               
           </el-form>
    </div>
</template>

<script>
// 工具栏配置
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线
  ["blockquote", "code-block"], // 引用  代码块
  [{ header: 1 }, { header: 2 }], // 1、2 级标题
  [{ list: "ordered" }, { list: "bullet" }], // 有序、无序列表
  [{ script: "sub" }, { script: "super" }], // 上标/下标
  [{ indent: "-1" }, { indent: "+1" }], // 缩进
  // [{'direction': 'rtl'}],                         // 文本方向
  [{ size: ["small", false, "large", "huge"] }], // 字体大小
  [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
  [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
  [{ font: [] }], // 字体种类
  [{ align: [] }], // 对齐方式
  ["clean"], // 清除文本格式
  ["link", "image", "video"] // 链接、图片、视频
];
import { quillEditor } from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import axios from 'axios'
export default {
    props: {
    /*编辑器的内容*/
    value: {
      type: String
    },
    /*图片大小*/
    maxSize: {
      type: Number,
      default: 4000 //kb
    }
  },
    components: {
    quillEditor
  },
  data() {
    return {
        infoForm:{
            a_title:'',
            a_imageUrl: '',
            content: '',
        },
        rules:{
            a_title:[{ required: true, message: '标题不能为空', trigger: 'blur' }],
            a_imageUrl:[{ required: true, message: '主题图片不能为空', trigger: 'blur' }],
            content:[{ required: true, message: '内容不能为空', trigger: 'blur' }],
        },

      
      quillUpdateImg: false, // 根据图片上传状态来确定是否显示loading动画，刚开始是false,不显示
      editorOption: {
        placeholder: "您想说点什么？",
        theme: "snow", // or 'bubble'
        modules: {
          toolbar: {
            container: toolbarOptions,
            // container: "#toolbar",
            handlers: {
              image: function(value) {
                if (value) {
                  // 触发input框选择图片文件
                  document.querySelector(".avatar-uploader input").click();
                } else {
                  this.quill.format("image", false);
                }
              },
              // link: function(value) {
              //   if (value) {
              //     var href = prompt('请输入url');
              //     this.quill.format("link", href);
              //   } else {
              //     this.quill.format("link", false);
              //   }
              // },
            }
          }
        }
      },
      serverUrl: "/in/upload", // 这里写你要上传的图片服务器地址
    }},
    methods: {
    cancel(){
      this.$router.push("contents")
    },
    onEditorBlur() {
      //失去焦点事件
    },
    onEditorFocus() {
      //获得焦点事件
    },
    onEditorChange() {
      //内容改变事件
      this.$emit("input", this.infoForm.content);
    },

    // 富文本图片上传前
    beforeUpload() {
      // 显示loading动画
      this.quillUpdateImg = true;
    },
    onSubmit(infoForm){
        this.$refs[infoForm].validate((valid) => {
            if (valid) {  
              console.log(this.infoForm)
              axios.post("/in/saveCommunicate",this.infoForm).then(result=>{
                if(result.code==200){
                   this.$message({
                    showClose: true,
                    message:result.msg,
                    type: 'success'
                  });
                  
                }else{
                   this.$message({
                    showClose: true,
                    message: result.msg,
                    type: 'success'
                  });
                }
                this.$router.push("contents")
              },error=>{})
            }else {
            console.log('error submit!!');
            return false;
          }
           });
    },
    uploadSuccess(res, file) {
      console.log(res)
      // res为图片服务器返回的数据
      // 获取富文本组件实例
      let quill = this.$refs.myQuillEditor.quill;
      // 如果上传成功
      
      if (res[0].code == 200) {
        // 获取光标所在位置
        let length = quill.getSelection().index;
        // 插入图片  res.url为服务器返回的图片地址
        quill.insertEmbed(length, "image", res[0].url);
        // 调整光标到最后
        quill.setSelection(length + 1);
      } else {
        this.$message.error("图片插入失败");
      }
      // loading动画消失
      this.quillUpdateImg = false;
    },
    // 富文本图片上传失败
    uploadError() {
      // loading动画消失
      this.quillUpdateImg = false;
      this.$message.error("图片插入失败");
    },
     handleAvatarSuccess(res, file) {
     console.log(res)
         if(res.code==200){
              this.infoForm.a_imageUrl = res.msg;
         }else{
              this.$message.error("图片插入失败");
         }
       
      },
      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
      }
  }
    
}
</script>
<style lang="scss" scoped>
.contentsContainer /deep/.contentForm{
  margin-bottom: 92px;
}
 .contentsContainer /deep/ .ql-snow .ql-tooltip[data-mode=link]::before {
  content: "请输入链接地址:";
}

 .contentsContainer /deep/ .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
    border-right: 0px;
    content: '保存';
    padding-right: 0px;
}

 .contentsContainer /deep/ .ql-snow .ql-tooltip[data-mode=video]::before {
    content: "请输入视频地址:";
}

 .contentsContainer /deep/ .ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: '14px';
}
 .contentsContainer /deep/ .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=small]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value=small]::before {
  content: '10px';
}
 .contentsContainer /deep/ .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=large]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value=large]::before {
  content: '18px';
}
 .contentsContainer /deep/ .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=huge]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value=huge]::before {
  content: '32px';
}


 .contentsContainer /deep/ .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: '标题1';
}
 .contentsContainer /deep/ .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: '标题2';
}
 .contentsContainer /deep/ .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: '标题3';
}
 .contentsContainer /deep/ .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: '标题4';
}
 .contentsContainer /deep/ .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
  content: '标题5';
}
 .contentsContainer /deep/ .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
  content: '标题6';
}

 .contentsContainer /deep/ .ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: '标准字体';
}
 .contentsContainer /deep/ .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=serif]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value=serif]::before {
  content: '衬线字体';
}
 .contentsContainer /deep/ .ql-snow .ql-picker.ql-font .ql-picker-label[data-value=monospace]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value=monospace]::before {
  content: '等宽字体';
}
* /deep/ .el-form-item__label {
    text-align: center;
    vertical-align: middle;
    float: left;
    font-size: 14px;
    color: #606266;
    line-height: 40px;
    padding: 0 12px 0 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}
 .contentsContainer /deep/.ql-snow  .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: '文本';
}

.contentsContainer{
  padding:30px 60px 30px 20px;
    .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  .uploader /deep/ .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .uploader .el-upload:hover {
    border-color: #409EFF;
  }
.editor {
  line-height: normal !important;
  height:500px;
}
.button{
     
}
.endForm{
  display:flex;
  justify-content:end;
}


}

</style>