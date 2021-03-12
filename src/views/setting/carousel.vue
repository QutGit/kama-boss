<template>
  <el-container>
    <el-header><h1>首页列表</h1></el-header>
    <!-- 筛选区域 -->
    <el-main>
      <el-form ref="form" class="fp-form" label-position="right" :inline="true" :model="form" label-width="70px">
        <div class="fp-form-footer">
          <div class="pull-right">
            <el-button type="primary" @click="add()">添加</el-button>
          </div>
        </div>
      </el-form>
    </el-main>
    <!-- 列表区域 -->
    <el-main>
      <el-table key="btable" v-loading="loading" :data="reconcList">
        <el-table-column prop="id" label="图片ID" />
        <el-table-column prop="title" label="图片名称" />
        <el-table-column label="图片类型">
          <template slot-scope="scope">{{ termName(scope.row.termId) }}</template>
        </el-table-column>
        <el-table-column prop="imgUrl" label="图片地址">
          <template slot-scope="scope">
            <img style="width: 100px" :src="scope.row.imgUrl">
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="danger" size="small" @click="deleteImage(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <el-main>
      <el-pagination background layout="prev, pager, next" :total="total" @current-change="pageChange" />
    </el-main>
    <el-dialog title="添加图片" :visible.sync="showDialog" width="60%">
      <el-form :model="form">
        <el-form-item label="图片名称" :label-width="formLabelWidth">
          <el-input v-model="form.title" placeholder="请输入图片描述" size="miedum" autocomplete="off" />
        </el-form-item>
        <el-form-item label="图片类型" :label-width="formLabelWidth">
          <el-select v-model="form.termId" placeholder="请选择">
            <el-option v-for="item in options" :key="item.termId" :label="item.name" :value="item.termId" />
          </el-select>
        </el-form-item>
        <el-form-item label="图片上传" :label-width="formLabelWidth">
          <el-upload
            action="#"
            :auto-upload="false"
            list-type="picture-card"
            :multiple="true"
            :on-preview="handlePictureCardPreview"
            :on-change="handleChange"
            :on-remove="handleRemove"
          >
            <i class="el-icon-plus" />
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button v-loading.fullscreen.lock="submitLoading" type="primary" @click="save()">保存</el-button>
      </span>
    </el-dialog>
    <!-- 图片预览 -->
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
    <el-dialog title="确定删除图片？" :visible.sync="deleteImageVisible">
      <img width="100%" :src="itemEntity.imgUrl" alt="">
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteImageVisible = false">取 消</el-button>
        <el-button type="danger" @click="deleteSubmit()">确定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import { getCategorys, createArticle, getArticles, deleteArticle } from '@/api/table'
export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      submitLoading: false,
      showDialog: false,
      dialogVisible: false,
      deleteImageVisible: false,
      formLabelWidth: '100px',
      fileList: [],
      reconcList: [],
      dialogImageUrl: '',
      form: {
        title: '',
        termId: ''
      },
      options: [],
      total: 0,
      itemEntity: 0,
      pageConf: {
        total: 0,
        limit: 10,
        offset: 0
      }
    }
  },
  mounted() {
    this.getTags()
    this.getList()
  },
  methods: {
    termName(termId) {
      const filters = this.options.filter((item) => item.termId === termId)
      let name = ''
      if (filters && filters.length) {
        name = filters[0].name
      }
      return name
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleChange(file, fileList) {
      this.fileList = fileList
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    add() {
      this.showDialog = true
    },
    async save() {
      const { termId, title } = this.form
      const fileList = this.fileList
      // 组装参数
      const formData = new FormData()
      formData.append('termId', termId)
      formData.append('title', title)
      fileList.forEach((item, index) => {
        formData.append('files', item.raw)
      })
      // 创建
      try {
        this.submitLoading = true
        const res = await createArticle(formData)
        this.submitLoading = false
        if (res && res.data && res.data.code === 0) {
          this.$message.success('添加成功')
          this.showDialog = false
          this.getList()
        }
      } catch (error) {
        this.$message.error(error.data.message)
        this.submitLoading = false
      }
    },
    async getTags() {
      const res = await getCategorys()
      if (res && res.data) {
        this.options = res.data.list
      }
    },
    async getList() {
      const { limit, offset } = this.pageConf
      const res = await getArticles({ id: '1', limit, offset })
      if (res && res.data && res.data.code === 0) {
        this.reconcList = res.data.list
        this.total = res.data.total
      }
    },
    pageChange(val) {
      const { limit } = this.pageConf
      const offset = (val - 1) * limit
      this.pageConf.offset = offset
      this.getList()
    },
    deleteImage(scope) {
      this.itemEntity = scope
      this.deleteImageVisible = true
    },
    async deleteSubmit() {
      try {
        const res = await deleteArticle({ id: this.itemEntity.id })
        if (res && res.data && res.data.code === 0) {
          this.deleteImageVisible = false
          this.$message.success('删除成功')
          this.getList()
        }
      } catch (error) {
        this.$message.success(error.data.message)
        this.deleteImageVisible = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
