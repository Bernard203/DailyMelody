<!--Lab5新增，搜索界面-->
<script setup lang="ts">
import {Back} from "@element-plus/icons-vue";
import {searchByCondition} from "../../api/product";
import {ref, computed} from "vue"
import {useRouter} from "vue-router";
import ProductItem from "../../components/ProductItem.vue";
import {parseCategory} from "../../utils";


const productList = ref()

const router = useRouter()

const name = ref()
const category = ref(null)
const price = ref()
const possibleCategories = ['FOOD', 'CLOTHES', 'ELECTRONICS', 'FURNITURE', 'ENTERTAINMENT', 'SPORTS', 'LUXURY']
const searchDisabled = computed(() => !(name.value != null || category.value != null || price.value != null))

function search() {
  const payload = {
    name: name.value,
    category: category.value === null ? 'ALL' : category.value,
    price: price.value,
  }
  searchByCondition(payload).then(res => {
    productList.value = res.data.result
  })
}

function clearData() {
  name.value = null
  category.value = null
  price.value = null
}

function toBackPage() {
  router.push("/allStore")
}

function toProductDetailPage(productId: number) {
  router.push("/productDetail/" + productId)
}

</script>

<template>
  <el-container>
    <el-main>

      <el-row :gutter="20">

        <el-col :span="1">
          <el-button @click="toBackPage()"
                     type="primary" circle plain class="back-button">
            <el-icon>
              <Back/>
            </el-icon>
          </el-button>
        </el-col>

        <el-col :span="8">
          <el-form-item label="商品名称">
            <el-input
                v-model="name"
                @keyup.enter.native="search"
                placeholder="不限"
            >
            </el-input>

          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="商品品类">
            <el-select v-model="category" placeholder="任意">
              <el-option v-for="item in possibleCategories" :key="item" :label="parseCategory(item)"
                         :value="item"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="5">
          <el-form-item label="最高价格">
            <el-input-number v-model="price" placeholder="不限">

            </el-input-number>
          </el-form-item>
        </el-col>


        <el-col :span="1.5">
          <el-button @click="clearData">清空</el-button>
        </el-col>

        <el-col :span="1">
          <el-button type="primary" @click="search" :disabled="searchDisabled">搜索</el-button>
        </el-col>
      </el-row>

      <el-divider/>

      <div class="all-product-main">

        <ProductItem class="product-item-list"
                     v-for="productVO in productList"
                     :productId="productVO.id"
                     :key="productVO.id"
                     @click="toProductDetailPage(productVO.id)"/>
      </div>
    </el-main>

  </el-container>
</template>

<style scoped>
.all-product-main {
  display: flex;
  flex-direction: row;
  padding: 20px;
  flex-flow: wrap;
  align-content: start;
  justify-content: start;
}
</style>