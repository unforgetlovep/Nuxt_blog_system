<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '~~/stores/user'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const userStore = useUserStore()
const isRegisterMode = ref(false)
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const closeModal = () => {
  emit('update:modelValue', false)
  // Reset form
  setTimeout(() => {
    isRegisterMode.value = false
    username.value = ''
    password.value = ''
    errorMessage.value = ''
  }, 300)
}

const handleSubmit = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    if (isRegisterMode.value) {
      const { error } = await useFetch('/api/auth/register', {
        method: 'POST',
        body: { username: username.value, password: password.value },
      })
      if (error.value) throw error.value
      // Auto login after register
    }
    
    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })

    if (error.value) throw error.value
    
    if (data.value?.user) {
      userStore.user = data.value.user
      userStore.isAuthenticated = true
      closeModal()
    }
  } catch (err: any) {
    errorMessage.value = err.statusMessage || (isRegisterMode.value ? '注册失败' : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" @click="closeModal"></div>

          <!-- Modal panel -->
          <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
            enter-to-class="translate-y-0 opacity-100 sm:scale-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="translate-y-0 opacity-100 sm:scale-100"
            leave-to-class="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
          >
            <div v-if="modelValue" class="inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:align-middle relative">
              
              <!-- Close Button -->
              <button @click="closeModal" class="absolute right-4 top-4 text-gray-400 hover:text-gray-600 focus:outline-none">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div class="bg-white px-6 pt-8 pb-6">
                <div class="mb-8 text-center">
                  <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#D71A1B] text-white font-bold text-lg mb-4">
                    π
                  </div>
                  <h3 class="text-xl font-bold text-gray-900" id="modal-title">
                    {{ isRegisterMode ? '加入少数派' : '登录少数派' }}
                  </h3>
                  <p class="mt-2 text-sm text-gray-500">
                    {{ isRegisterMode ? '开启你的数字生活创作之旅' : '欢迎回来，继续探索少数派' }}
                  </p>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                  <div>
                    <input
                      v-model="username"
                      type="text"
                      placeholder="用户名"
                      class="block w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                    >
                  </div>
                  <div>
                    <input
                      v-model="password"
                      type="password"
                      placeholder="密码"
                      class="block w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                    >
                  </div>

                  <div v-if="errorMessage" class="text-xs text-red-500 mt-2 text-center bg-red-50 py-2 rounded-md">
                    {{ errorMessage }}
                  </div>

                  <button
                    type="submit"
                    :disabled="loading"
                    class="mt-6 flex w-full justify-center rounded-full border border-transparent bg-gray-900 py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:opacity-50"
                  >
                    {{ loading ? '处理中...' : (isRegisterMode ? '注册并登录' : '登录') }}
                  </button>
                </form>

                <div class="mt-6 text-center text-sm">
                  <span class="text-gray-500">{{ isRegisterMode ? '已有账号？' : '还没有账号？' }}</span>
                  <button 
                    type="button" 
                    @click="isRegisterMode = !isRegisterMode; errorMessage = ''" 
                    class="font-bold text-[#D71A1B] hover:text-red-700 ml-1 focus:outline-none"
                  >
                    {{ isRegisterMode ? '直接登录' : '立即注册' }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>