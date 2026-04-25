<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Github, BookOpen, Wrench, ArrowRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="flex items-center justify-center h-full">
    <div class="text-center space-y-8">
      <!-- Avatar -->
      <div class="flex justify-center">
        <div class="relative">
          <img
            src="/avatar.webp"
            alt="Hachimi2333"
            class="w-32 h-32 rounded-full object-cover shadow-lg"
          />
          <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-background"></div>
        </div>
      </div>

      <!-- One-liner -->
      <div class="space-y-2">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight">
          Hachimi2333
        </h1>
        <p class="text-lg text-muted-foreground max-w-md mx-auto">
          青空一直線、目指せ一着！
        </p>
      </div>

      <!-- Buttons -->
      <div class="flex flex-wrap justify-center gap-3">
        <Button @click="router.push('/posts')" class="group">
          <BookOpen class="mr-2 h-4 w-4" />
          博客
          <ArrowRight class="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
        <Button variant="outline" @click="router.push('/tools')">
          <Wrench class="mr-2 h-4 w-4" />
          工具
        </Button>
        <Button variant="outline" as="a" href="https://github.com/hachimi2333" target="_blank" rel="noopener noreferrer">
          <Github class="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>
    </div>
  </div>
</template>
