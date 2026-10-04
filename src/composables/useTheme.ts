import { ref } from 'vue'

const STORAGE_KEY = 'theme'

/**
 * Shared singleton theme state.
 *
 * The `dark` class is applied by a tiny inline script in `index.html` before the
 * first paint, so this module only has to adopt whatever that script decided —
 * it must not re-apply a different value, or the page would flash. The previous
 * implementation called `initTheme()` from `onMounted`, which meant dark-mode
 * visitors saw a light page until Vue had mounted.
 */
const isDark = ref(
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
)

function applyTheme(dark: boolean) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark)
  }
  try {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  } catch {
    // Persisting the preference is best-effort.
  }
}

export function useTheme() {
  function setTheme(dark: boolean) {
    isDark.value = dark
    applyTheme(dark)
  }

  function toggleTheme() {
    setTheme(!isDark.value)
  }

  return { isDark, setTheme, toggleTheme }
}
