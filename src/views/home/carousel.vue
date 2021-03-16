<template>
  <el-container>
    <el-header><h1>首页列表</h1></el-header>
    <!-- 筛选区域 -->
    <el-main>
      <el-form ref="form" class="fp-form" label-position="right" :inline="true" :model="form" label-width="70px">
        <el-form-item label="文章标题" prop="name">
          <el-input v-model="sForm.title"></el-input>
        </el-form-item>
        <el-form-item label="创建时间" label-width="80px">
          <el-date-picker
            v-model="days"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="文章类型" label-width="70px">
          <el-select v-model="sForm.termId" placeholder="全部">
            <el-option v-for="item in options" :key="item.termId" :label="item.name" :value="item.termId" />
          </el-select>
        </el-form-item>
        <el-form-item label="文章状态" label-width="70px">
          <el-select v-model="sForm.deleted" placeholder="全部">
            <el-option label="全部" value="" />
            <el-option label="已下架" :value="1" />
            <el-option label="发布中" :value="0" />
          </el-select>
        </el-form-item>
        <div class="fp-form-footer">
          <div class="pull-right">
            <el-button type="primary" @click="add()">添加</el-button>
            <el-button type="default" @click="reset()">重置</el-button>
            <el-button type="default" @click="search()">查询</el-button>
          </div>
        </div>
      </el-form>
    </el-main>
    <!-- 列表区域 -->
    <el-main>
      <el-table key="btable" v-loading="loading" :data="reconcList">
        <el-table-column prop="id" label="ID" width="50"/>
        <el-table-column label="文章类型" width="80">
          <template slot-scope="scope">{{ termName(scope.row.termId) }}</template>
        </el-table-column>
        <el-table-column prop="title" label="文章名称" />
        <el-table-column :show-overflow-tooltip="true" prop="description" label="文章描述" />
        <el-table-column prop="deleted" label="发布状态" width="80">
          <template slot-scope="scope">
            {{scope.row.deleted === 0 ? '已发布' : '已下架'}}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="createTime" label="更新时间" width="160" />
        <el-table-column prop="imgUrl" label="文章地址">
          <template slot-scope="scope">
            <a :href="scope.row.imgUrl" target="_blank" title="点击查看大图">
              <img style="width: 50px; height: 50px;" :src="scope.row.imgUrl">
            </a>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button v-if="scope.row.deleted === 0" type="danger" size="small" @click="deleteImage(scope.row)">下架</el-button>
            <el-button v-if="scope.row.deleted === 1" type="primary" size="small" @click="recoverImage(scope.row)">恢复</el-button>
            <el-button type="primary" size="small" @click="updateImage(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <el-main>
      <el-pagination background layout="prev, pager, next" :total="total" @current-change="pageChange" />
    </el-main>
    <!-- 编辑文章 -->
    <el-dialog title="编辑文章" :visible.sync="showEditDialog" width="60%" :before-close="onClose">
      <el-form :model="itemEntity">
        <el-form-item label="文章类型" :label-width="formLabelWidth">
          <el-select v-model="itemEntity.termId" placeholder="请选择">
            <el-option v-for="item in options" :key="item.termId" :label="item.name" :value="item.termId" />
          </el-select>
        </el-form-item>
        <el-form-item label="文章名称" :label-width="formLabelWidth">
          <el-input v-model="itemEntity.title" placeholder="请输入文章标题" size="miedum" autocomplete="off" />
        </el-form-item>
        <el-form-item label="文章描述" :label-width="formLabelWidth">
          <el-input v-model="itemEntity.description" placeholder="请输入文章描述" type="textarea" :rows="4" size="miedum" autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <img width="200px" :src="itemEntity.imgUrl" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="onClose">取 消</el-button>
        <el-button v-loading.fullscreen.lock="submitLoading" type="primary" @click="save()">保存</el-button>
      </span>
    </el-dialog>
    <!-- 添加文章 -->
    <el-dialog title="添加文章" :visible.sync="showDialog" width="60%" :before-close="onClose">
      <el-form :model="form">
        <el-form-item label="文章类型" :label-width="formLabelWidth">
          <el-select v-model="form.termId" placeholder="请选择">
            <el-option v-for="item in options" :key="item.termId" :label="item.name" :value="item.termId" />
          </el-select>
        </el-form-item>
        <el-form-item label="文章名称" :label-width="formLabelWidth">
          <el-input v-model="form.title" placeholder="请输入文章标题" size="miedum" autocomplete="off" />
        </el-form-item>
        <el-form-item label="文章描述" :label-width="formLabelWidth">
          <el-input v-model="form.description" placeholder="请输入文章描述" type="textarea" :rows="4" size="miedum" autocomplete="off" />
        </el-form-item>
        <el-form-item label="文章上传" :label-width="formLabelWidth">
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
        <el-button @click="onClose">取 消</el-button>
        <el-button v-loading.fullscreen.lock="submitLoading" type="primary" @click="save()">保存</el-button>
      </span>
    </el-dialog>
    <!-- 文章预览 -->
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
    <!-- 删除文章 弹窗 -->
    <el-dialog title="确定下架文章？" :visible.sync="deleteImageVisible">
      <img width="100%" :src="itemEntity.imgUrl" alt="">
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteImageVisible = false">取 消</el-button>
        <el-button type="danger" @click="deleteSubmit()">确定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import { getCategorys, createArticle, getArticles, deleteArticle, recoverArticle, updateArticle } from '@/api/table'
import dayjs from 'dayjs'
export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      submitLoading: false,
      showDialog: false,
      dialogVisible: false,
      deleteImageVisible: false,
      showEditDialog: false,
      isEdit: false,
      formLabelWidth: '100px',
      fileList: [],
      reconcList: [],
      dialogImageUrl: '',
      days: [],
      form: {
        title: '',
        termId: '',
        description: '',
        imgUrl: ''
      },
      sForm: {
        title: '',
        termId: '',
        deleted: '',
        startTime: '',
        endTime: ''
      },
      options: [],
      total: 0,
      itemEntity: {
        id: '',
        title: '',
        termId: '',
        description: '',
        imgUrl: ''
      },
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
    onClose() {
      this.form = {}
      this.itemEntity = {}
      this.showDialog = false
      this.showEditDialog = false
    },
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
    search () {
      this.getList()
    },
    reset () {
      this.sForm = {
        title: '',
        termId: '',
        deleted: '',
        startTime: '',
        endTime: ''
      }
      this.days = []
      this.getList()
    },
    add() {
      this.showDialog = true
      this.isEdit = false
    },
    formParam(scope) {
      const { id, termId, title, description } = scope
      const fileList = this.fileList
      // 组装参数
      const formData = new FormData()
      formData.append('termId', termId)
      formData.append('title', title)
      formData.append('description', description)
      fileList.forEach((item, index) => {
        formData.append('files', item.raw)
      })
      formData.append('id', id)
      return formData
    },
    async save() {
      try {
        this.submitLoading = true
        let res = null
        if (this.isEdit) { // 编辑
          const data = this.formParam(this.itemEntity)
          res = await updateArticle(data)
        } else { // 创建
          const data = this.formParam(this.form)
          res = await createArticle(data)
        }
        this.submitLoading = false
        if (res && res.data && res.data.code === 0) {
          this.$message.success('添加成功')
          this.showDialog = false
          this.showEditDialog = false
          this.form = {}
          this.fileList = []
          this.getList()
        }
      } catch (error) {
        this.$message.error(error.data.message)
        this.submitLoading = false
      }
    },
    // 获取标签
    async getTags() {
      const res = await getCategorys()
      if (res && res.data) {
        this.options = res.data.list
      }
    },
    // 获取列表
    async getList(params) {
      const { limit, offset } = this.pageConf
      const days = this.days
      if (days.length) {
        this.sForm.startTime = days[0]
        this.sForm.endTime = days[1]
      }
      this.loading = true
      try {
        const res = await getArticles({ id: '1', limit, offset, ...this.sForm })
        this.loading = false
        if (res && res.data && res.data.code === 0) {
          const list = res.data.list
          list.forEach((item) => {
            item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
          })
          this.reconcList = list
          this.total = res.data.total
        }
      } catch (error) {
        this.$message.error(error.data.message)
        this.loading = false
      }

    },
    // 分页监听
    pageChange(val) {
      const { limit } = this.pageConf
      const offset = (val - 1) * limit
      this.pageConf.offset = offset
      this.getList()
    },
    // 删除文章 弹窗
    deleteImage(scope) {
      this.itemEntity = scope
      this.deleteImageVisible = true
    },
    // 删除文章 提交
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
    },
    // 恢复删除
    async recoverImage(scope) {
      try {
        const res = await recoverArticle({ id: scope.id })
        if (res && res.data && res.data.code === 0) {
          this.$message.success('操作成功')
          this.getList()
        }
      } catch (error) {
        this.$message.success(error.data.message)
      }
    },
    // 编辑
    updateImage(scope) {
      this.showEditDialog = true
      this.isEdit = true
      this.itemEntity = JSON.parse(JSON.stringify(scope))
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
