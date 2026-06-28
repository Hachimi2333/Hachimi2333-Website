<script setup lang="ts">
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'

interface Crumb {
  label: string
  to?: string
}

defineProps<{ items: Crumb[] }>()
</script>

<template>
  <Breadcrumb class="mb-6">
    <BreadcrumbList>
      <template v-for="(item, i) in items" :key="i">
        <BreadcrumbSeparator v-if="i > 0" />
        <BreadcrumbItem>
          <BreadcrumbLink v-if="item.to" as-child>
            <router-link :to="item.to">{{ item.label }}</router-link>
          </BreadcrumbLink>
          <BreadcrumbPage v-else>{{ item.label }}</BreadcrumbPage>
        </BreadcrumbItem>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
