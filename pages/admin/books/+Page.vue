<script setup lang="ts">
import { ref, onMounted, watch, inject } from 'vue'
import AdminLayout from '../../../components/AdminLayout.vue'
import { getAdmin } from '../../../lib/stores/userStore'

// 注入父组件提供的函数
const showToast = inject<(message: string, type: 'success' | 'error' | 'info') => void>('showToast')
const showConfirm = inject<(message: string, title?: string) => Promise<boolean>>('showConfirm')

interface Category {
  id: number
  name: string
}

interface Book {
  id: number
  isbn: string
  title: string
  author: string
  publisher: string | null
  price: number
  stockQuantity: number
  description: string | null
  coverImage: string | null
  categoryId: number | null
  status: number
  salesCount: number
  createdAt: string
  category: Category | null
}

const books = ref<Book[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const keyword = ref('')
const categoryFilter = ref<number | undefined>(undefined)
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const formData = ref<Partial<Book>>({})
const showStockModal = ref(false)
const stockFormData = ref({ bookId: 0, bookTitle: '', currentStock: 0, quantity: 0, remark: '' })

const fetchBooks = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      pageSize: String(pageSize.value),
    })
    if (keyword.value) params.set('keyword', keyword.value)
    if (categoryFilter.value) params.set('categoryId', String(categoryFilter.value))

    const res = await fetch(`/api/admin/books?${params}`)
    const data = await res.json()
    books.value = data.data || []
    total.value = data.total || 0
    totalPages.value = data.totalPages || 0
  } catch (error) {
    console.error('Failed to fetch books:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await fetch('/api/categories')
    const data = await res.json()
    categories.value = data.data || []
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  formData.value = { status: 1, stockQuantity: 0 }
  showModal.value = true
}

const openEditModal = (book: Book) => {
  modalMode.value = 'edit'
  formData.value = { ...book }
  showModal.value = true
}

const saveBook = async () => {
  try {
    const admin = getAdmin()
    const url = modalMode.value === 'create' 
      ? '/api/admin/books' 
      : `/api/admin/books/${formData.value.id}`
    const method = modalMode.value === 'create' ? 'POST' : 'PUT'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData.value,
        adminId: admin?.id,
        adminName: admin?.fullName || admin?.username
      })
    })
    
    showModal.value = false
    await fetchBooks()
  } catch (error) {
    console.error('Failed to save book:', error)
  }
}

const deleteBook = async (id: number) => {
  const confirmed = await showConfirm?.('确定要删除这本图书吗？', '删除确认')
  if (!confirmed) return
  try {
    const admin = getAdmin()
    const params = new URLSearchParams({
      adminId: String(admin?.id || ''),
      adminName: admin?.fullName || admin?.username || ''
    })
    await fetch(`/api/admin/books/${id}?${params}`, { method: 'DELETE' })
    await fetchBooks()
  } catch (error) {
    console.error('Failed to delete book:', error)
  }
}

const updateStock = async (bookId: number, quantity: number) => {
  // 不再使用 prompt，而是打开模态框
  // 这个函数现在从模态框调用
  try {
    const admin = getAdmin()
    await fetch(`/api/admin/books/${bookId}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        quantity, 
        operatorId: admin?.id,
        remark: stockFormData.value.remark || '手动调整库存',
        adminName: admin?.fullName || admin?.username
      })
    })
    await fetchBooks()
    showStockModal.value = false
  } catch (error) {
    console.error('Failed to update stock:', error)
  }
}

const openStockModal = (book: Book) => {
  stockFormData.value = {
    bookId: book.id,
    bookTitle: book.title,
    currentStock: book.stockQuantity,
    quantity: 0,
    remark: ''
  }
  showStockModal.value = true
}

const confirmStockUpdate = async () => {
  if (stockFormData.value.quantity === 0) {
    showToast?.('请输入库存变动数量', 'error')
    return
  }
  await updateStock(stockFormData.value.bookId, stockFormData.value.quantity)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
}

onMounted(() => {
  fetchBooks()
  fetchCategories()
})
watch([page, categoryFilter], fetchBooks)

const handleSearch = () => {
  page.value = 1
  fetchBooks()
}
</script>

<template>
  <AdminLayout>
    <template #title>图书管理</template>
    
    <div class="space-y-4">
      <!-- Search & Filter -->
      <div class="card bg-base-100 shadow">
        <div class="card-body py-4">
          <div class="flex flex-wrap gap-4 items-end justify-between">
            <div class="flex flex-wrap gap-4 items-end">
              <div class="form-control">
                <label class="label"><span class="label-text">搜索</span></label>
                <input 
                  v-model="keyword"
                  type="text" 
                  placeholder="书名/作者/ISBN" 
                  class="input input-bordered input-sm w-60"
                  @keyup.enter="handleSearch"
                />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">分类</span></label>
                <select v-model="categoryFilter" class="select select-bordered select-sm">
                  <option :value="undefined">全部分类</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <button @click="handleSearch" class="btn btn-primary btn-sm">搜索</button>
              <button @click="keyword = ''; categoryFilter = undefined; handleSearch()" class="btn btn-ghost btn-sm">重置</button>
            </div>
            <button @click="openCreateModal" class="btn btn-success btn-sm">
              + 添加图书
            </button>
          </div>
        </div>
      </div>

      <!-- Books Table -->
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>图书</th>
                  <th>ISBN</th>
                  <th>分类</th>
                  <th>价格</th>
                  <th>库存</th>
                  <th>销量</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="8" class="text-center py-8">
                    <span class="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
                <tr v-else-if="books.length === 0">
                  <td colspan="8" class="text-center py-8 text-base-content/60">
                    暂无图书数据
                  </td>
                </tr>
                <tr v-for="book in books" :key="book.id">
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="avatar">
                        <div class="w-12 h-16 rounded">
                          <img 
                            :src="book.coverImage || 'https://via.placeholder.com/80x120?text=Book'" 
                            :alt="book.title"
                          />
                        </div>
                      </div>
                      <div>
                        <div class="font-bold max-w-[200px] truncate">{{ book.title }}</div>
                        <div class="text-sm text-base-content/60">{{ book.author }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="font-mono text-sm">{{ book.isbn }}</td>
                  <td>
                    <span class="badge badge-ghost">{{ book.category?.name || '-' }}</span>
                  </td>
                  <td class="font-semibold text-primary">{{ formatCurrency(book.price) }}</td>
                  <td>
                    <span 
                      class="badge"
                      :class="book.stockQuantity < 10 ? 'badge-error' : 'badge-success'"
                    >
                      {{ book.stockQuantity }}
                    </span>
                  </td>
                  <td>{{ book.salesCount }}</td>
                  <td>
                    <span 
                      class="badge badge-sm"
                      :class="book.status === 1 ? 'badge-success' : 'badge-error'"
                    >
                      {{ book.status === 1 ? '上架' : '下架' }}
                    </span>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button @click="openEditModal(book)" class="btn btn-ghost btn-xs">编辑</button>
                      <button @click="openStockModal(book)" class="btn btn-ghost btn-xs">库存</button>
                      <button @click="deleteBook(book.id)" class="btn btn-ghost btn-xs text-error">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center mt-4">
            <div class="text-sm text-base-content/60">共 {{ total }} 条记录</div>
            <div class="join">
              <button class="join-item btn btn-sm" :disabled="page <= 1" @click="page--">«</button>
              <button class="join-item btn btn-sm">{{ page }} / {{ totalPages }}</button>
              <button class="join-item btn btn-sm" :disabled="page >= totalPages" @click="page++">»</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Book Modal -->
    <dialog :class="['modal', { 'modal-open': showModal }]">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">{{ modalMode === 'create' ? '添加图书' : '编辑图书' }}</h3>
        
        <form @submit.prevent="saveBook" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label"><span class="label-text w-32">ISBN *</span></label>
              <input v-model="formData.isbn" type="text" class="input input-bordered w-full" required />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text w-32">书名 *</span></label>
              <input v-model="formData.title" type="text" class="input input-bordered w-full" required />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text w-32">作者 *</span></label>
              <input v-model="formData.author" type="text" class="input input-bordered w-full" required />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text w-32">出版社</span></label>
              <input v-model="formData.publisher" type="text" class="input input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text w-32">价格 *</span></label>
              <input v-model="formData.price" type="number" step="0.01" class="input input-bordered w-full" required />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text w-32">库存</span></label>
              <input v-model="formData.stockQuantity" type="number" class="input input-bordered w-full" />
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text w-32">分类</span></label>
              <select v-model="formData.categoryId" class="select select-bordered w-full">
                <option :value="null">无分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-control">
              <label class="label"><span class="label-text w-32">状态</span></label>
              <select v-model="formData.status" class="select select-bordered w-full">
                <option :value="1">上架</option>
                <option :value="0">下架</option>
              </select>
            </div>
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text w-32">封面图片URL</span></label>
            <input v-model="formData.coverImage" type="text" class="input input-bordered w-full" />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text w-32">描述</span></label>
            <textarea v-model="formData.description" class="textarea textarea-bordered w-full h-24"></textarea>
          </div>

          <div class="modal-action">
            <button type="button" @click="showModal = false" class="btn">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showModal = false">close</button>
      </form>
    </dialog>

    <!-- Stock Update Modal -->
    <dialog :class="['modal', { 'modal-open': showStockModal }]">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">调整库存</h3>
        
        <div class="space-y-4">
          <div class="alert alert-info">
            <div>
              <div class="font-medium">{{ stockFormData.bookTitle }}</div>
              <div class="text-sm">当前库存: {{ stockFormData.currentStock }}</div>
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">库存变动数量 *</span>
            </label>
            <input 
              v-model.number="stockFormData.quantity" 
              type="number" 
              class="input input-bordered w-full" 
              placeholder="例如: +10 或 -5"
            />
            <label class="label">
              <span class="label-text-alt text-base-content/60">正数增加，负数减少</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">备注</span>
            </label>
            <textarea 
              v-model="stockFormData.remark" 
              class="textarea textarea-bordered w-full" 
              placeholder="请输入调整原因"
            ></textarea>
          </div>

          <div v-if="stockFormData.quantity !== 0" class="alert">
            <div>
              <div class="text-sm">调整后库存: <span class="font-bold">{{ stockFormData.currentStock + stockFormData.quantity }}</span></div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button @click="showStockModal = false" class="btn btn-ghost">取消</button>
          <button @click="confirmStockUpdate" class="btn btn-primary">确认</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showStockModal = false">close</button>
      </form>
    </dialog>
  </AdminLayout>
</template>
