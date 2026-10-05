<template>
  <!--
    Single page gutter for the whole site.

    Every routed view goes through this component, so the reading width and the
    vertical rhythm cannot drift between pages the way `container max-w-4xl px-4
    py-8` repeated in five files did.
  -->
  <div class="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
    <slot />
  </div>
</template>
