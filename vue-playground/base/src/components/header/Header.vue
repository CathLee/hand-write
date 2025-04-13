<!--
 * @Date: 2025-04-13 14:49:20
 * @Description: 
-->
<template>
  <header>
    <button @click="home()">首页</button>
    <button v-for="(item, index) in navList" :key="index" @click="change(item, index)"
      :class="{ 'select': index === selectIndex }">{{ item.name }}</button>
  </header>
  <main id="micro-container">
    <div class="home" v-if="selectIndex == null">主-----------------------------页</div>
  </main>
  <footer>
    hhhhh备案咯
  </footer>
</template>
<script setup lang="ts">
import { ref, reactive, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
const router = useRouter()
//route是路由实例内容，包含子路由内容
const route = useRoute()
//当前选中按钮
let selectIndex = ref<number | null>(null)
//导航菜单
const navList = [
  { name: "应用1", url: "vue1" },
  { name: "应用2", url: "vue2" },
  { name: "应用3", url: "react" },
]

const change = (item: { name: string, url: string }, index: number) => {
  selectIndex.value = index
  router.push(item.url)
}

const home = () => {
  router.push('/')
  selectIndex.value = null
}
watch(route, (v) => {
  let index = navList.findIndex(res => v.fullPath.indexOf(res.url) > -1)
  selectIndex.value = index === -1 ? null : index
}, { deep: true })



</script>
<style lang="scss" scoped>
header {
  height: 40px;
  background: #409EFF;
  display: flex;
  justify-content: center;
  align-items: center;
}

button {
  margin-left: 15px;
}

main {
  height: 850px;
}

footer {
  height: 40px;
  line-height: 40px;
  text-align: center;
  color: #fff;
  background: #67C23A;
}

.select {
  background: #67C23A;
  border: none;
  color: #fff;
}

.home {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 25px;
}
</style>
