<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const isMenuOpen = ref(false)
const theme = ref<'light' | 'dark'>('light')
const floatingMenu = ref<HTMLElement | null>(null)
const menuButton = ref<HTMLButtonElement | null>(null)

const isDark = computed(() => theme.value === 'dark')
const username = computed(() => authStore.user?.username ?? '')
const currentHour = ref(new Date().getHours())
let greetingTimer: number | undefined

const greeting = computed(() => {
  const hour = currentHour.value
  if (hour >= 5 && hour < 11) return '早上好'
  if (hour >= 11 && hour < 14) return '中午好'
  if (hour >= 14 && hour < 18) return '下午好'
  return '晚上好'
})
const headerGreeting = computed(() =>
  username.value ? `${greeting.value}，${username.value}` : greeting.value,
)

// 这些页面仍在规划中：保留设计入口，暂不跳转到不存在的路由。
const upcomingPages = [
  { label: '待办事项', icon: 'M9 5h12M9 12h12M9 19h12M3 5l1 1 2-3M3 12l1 1 2-3M3 19l1 1 2-3' },
  {
    label: '收藏',
    icon: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z',
  },
  {
    label: '知识图谱',
    icon: 'M12 7v5M5 17v-5h14v5M9 3h6v4H9zM2 17h6v4H2zM9 17h6v4H9zM16 17h6v4h-6zM12 12v5',
  },
  { label: '回收站', icon: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7' },
  { label: '设置', icon: 'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6' },
]

function toggleTheme() {
  theme.value = isDark.value ? 'light' : 'dark'
}

function closeMenuWithFocus() {
  if (!isMenuOpen.value) return
  isMenuOpen.value = false
  menuButton.value?.focus()
}

function handleOutsidePointer(event: PointerEvent) {
  if (event.target instanceof Node && !floatingMenu.value?.contains(event.target)) {
    isMenuOpen.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false
  },
)

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsidePointer)
  greetingTimer = window.setInterval(() => {
    currentHour.value = new Date().getHours()
  }, 60_000)
})
onUnmounted(() => {
  document.removeEventListener('pointerdown', handleOutsidePointer)
  window.clearInterval(greetingTimer)
})
</script>

<template>
  <div class="app-layout" :data-theme="theme" @keydown.esc="closeMenuWithFocus">
    <div class="app-shell">
      <header class="app-header">
        <div class="app-brand">知序</div>
        <div class="user-profile">
          <span class="username" :title="headerGreeting">{{ headerGreeting }}</span>
          <button class="logout-button" type="button" disabled aria-label="登出（功能待实现）">
            登出
          </button>
        </div>
      </header>

      <div class="app-content">
        <RouterView />
      </div>

      <!-- 右侧始终保留独立空间，菜单展开不会盖住内容或改变内容宽度。 -->
      <aside class="navigation-rail" aria-label="导航与外观">
        <div ref="floatingMenu" class="floating-menu">
          <button
            class="theme-button"
            type="button"
            :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
            @click="toggleTheme"
          >
            <span class="round-button" aria-hidden="true">
              <svg v-if="isDark" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path
                  d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24">
                <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />
              </svg>
            </span>
          </button>

          <div
            class="navigation-reveal"
            :class="{ 'is-open': isMenuOpen }"
            :inert="!isMenuOpen"
            :aria-hidden="!isMenuOpen"
          >
            <div class="navigation-clip">
              <nav id="app-navigation" class="navigation-list" aria-label="主应用导航">
                <RouterLink
                  class="navigation-item navigation-link"
                  to="/app/notes"
                  @click="closeMenuWithFocus"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 3h14v18H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM6 3v18M10 8h6M10 12h6" />
                  </svg>
                  <span>全部笔记</span>
                  <span class="current-indicator" aria-hidden="true"></span>
                </RouterLink>
                <button
                  v-for="page in upcomingPages"
                  :key="page.label"
                  class="navigation-item"
                  type="button"
                  disabled
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="page.icon" /></svg>
                  <span>{{ page.label }}</span>
                  <span class="upcoming-label">待开发</span>
                </button>
              </nav>
            </div>
          </div>

          <button
            ref="menuButton"
            class="menu-toggle round-button"
            type="button"
            :aria-label="isMenuOpen ? '收起导航' : '展开导航'"
            :aria-expanded="isMenuOpen"
            aria-controls="app-navigation"
            @click="isMenuOpen = !isMenuOpen"
          >
            <svg viewBox="0 0 24 24" :class="{ 'is-open': isMenuOpen }" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  --sf-background: #f5f6f8;
  --sf-surface: #ffffff;
  --sf-text: #242830;
  --sf-text-secondary: #626b78;
  --sf-border: #dde1e7;
  --sf-accent: #526f9f;
  --sf-selected: #e8eef7;
  --sf-soft: #eef0f3;
  --sf-shadow: 0 8px 28px rgb(36 40 48 / 7%);
  min-height: 100vh;
  min-height: 100svh;
  background: var(--sf-background);
  color: var(--sf-text);
  color-scheme: light;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.app-layout[data-theme='dark'] {
  --sf-background: #12161c;
  --sf-surface: #1b2129;
  --sf-text: #e5eaf1;
  --sf-text-secondary: #a4afbe;
  --sf-border: #303a47;
  --sf-accent: #a9bedf;
  --sf-selected: #2b3a50;
  --sf-soft: #252e3a;
  --sf-shadow: 0 8px 28px rgb(0 0 0 / 18%);
  color-scheme: dark;
}

.app-shell {
  display: grid;
  /* 两边等宽：主内容相对整个窗口居中，右边留给独立菜单。 */
  grid-template-columns: minmax(152px, 1fr) minmax(0, 1440px) minmax(152px, 1fr);
  gap: 16px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 16px 24px;
}

.app-header {
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  min-height: 36px;
}

.app-brand {
  flex-shrink: 0;
  font-size: 22px;
  font-weight: 700;
}

.user-profile {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
  color: var(--sf-text-secondary);
}

.username {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.logout-button {
  flex-shrink: 0;
  min-height: 36px;
  padding: 6px 14px;
  border: 1px solid var(--sf-border);
  border-radius: 10px;
  background: var(--sf-surface);
  color: var(--sf-text);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: not-allowed;
}

.app-content {
  grid-column: 2;
  min-width: 0;
  min-height: calc(100vh - 96px);
  min-height: calc(100svh - 96px);
  padding: clamp(24px, 4vw, 40px);
  border: 1px solid var(--sf-border);
  border-radius: 24px;
  background: var(--sf-surface);
  box-shadow: var(--sf-shadow);
  overflow-wrap: anywhere;
}

.app-content :deep(h1) {
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 500;
  line-height: 1.4;
}

.app-content :deep(p) {
  color: var(--sf-text-secondary);
}

.navigation-rail {
  grid-column: 3;
  align-self: start;
  position: sticky;
  top: 24px;
  height: calc(100vh - 96px);
  height: calc(100svh - 96px);
  min-height: 200px;
}

.floating-menu {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0;
  width: 152px;
  height: 100%;
  margin-left: auto;
}

.theme-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  margin-bottom: 12px;
  border: 0;
  background: transparent;
  color: var(--sf-text);
  cursor: pointer;
  font: inherit;
}

.round-button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  padding: 0;
  border: 1px solid var(--sf-border);
  border-radius: 50%;
  background: var(--sf-surface);
  color: var(--sf-text);
  box-shadow: var(--sf-shadow);
}

.menu-toggle {
  cursor: pointer;
}

.navigation-reveal {
  display: grid;
  grid-template-rows: 0fr;
  width: 100%;
  margin-bottom: 0;
  opacity: 0;
}

.navigation-reveal.is-open {
  grid-template-rows: 1fr;
  margin-bottom: 12px;
  opacity: 1;
}

.navigation-clip {
  min-height: 0;
  overflow: hidden;
}

.navigation-list {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  max-height: max(80px, calc(100svh - 288px));
  padding: 4px;
  overflow-y: auto;
  transform: translateY(8px) scale(0.98);
  transform-origin: bottom right;
}

.navigation-reveal.is-open .navigation-list {
  transform: translateY(0) scale(1);
}

.navigation-item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  max-width: 100%;
  padding: 10px;
  border: 1px solid var(--sf-border);
  border-radius: 24px;
  background: var(--sf-surface);
  color: var(--sf-text);
  font: inherit;
  font-size: 14px;
  text-decoration: none;
  white-space: nowrap;
}

.navigation-link {
  cursor: pointer;
}

.navigation-link.router-link-active,
.navigation-link:hover,
.theme-button:hover .round-button,
.menu-toggle:hover {
  background: var(--sf-selected);
  color: var(--sf-accent);
}

.current-indicator {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.navigation-item:disabled {
  color: var(--sf-text-secondary);
  cursor: not-allowed;
}

.upcoming-label {
  font-size: 11px;
}

.app-layout svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.round-button svg {
  width: 23px;
  height: 23px;
}
.menu-toggle svg.is-open {
  transform: rotate(45deg);
}

.theme-button:focus-visible,
.menu-toggle:focus-visible,
.navigation-link:focus-visible {
  outline: 2px solid var(--sf-accent);
  outline-offset: 4px;
}

@media (max-width: 1024px) {
  .app-shell {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
    padding: 16px 16px 24px;
  }
  .app-header {
    grid-column: 1;
    gap: 12px;
  }
  .app-brand {
    font-size: 20px;
  }
  .user-profile {
    gap: 8px;
  }
  .app-content {
    grid-column: 1;
    min-height: 320px;
    padding: 24px;
    border-radius: 20px;
  }
  .navigation-rail {
    grid-column: 1;
    position: static;
    min-height: 0;
    height: auto;
  }
  .floating-menu {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 56px;
    gap: 16px;
    align-items: center;
    width: 100%;
  }
  .navigation-reveal,
  .navigation-reveal.is-open {
    grid-column: 1 / -1;
    grid-row: 1;
    margin-bottom: 0;
  }
  .navigation-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-height: none;
    padding: 4px;
  }
  .navigation-item {
    justify-content: center;
    gap: 6px;
    padding: 10px 8px;
    font-size: 13px;
  }
  .theme-button {
    grid-column: 1;
    grid-row: 2;
    justify-self: start;
    margin-bottom: 0;
  }
  .menu-toggle {
    grid-column: 2;
    grid-row: 2;
    justify-self: end;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .navigation-reveal {
    transition:
      grid-template-rows 240ms cubic-bezier(0.22, 1, 0.36, 1),
      margin-bottom 240ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 180ms ease;
  }
  .navigation-list {
    transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .app-layout,
  .app-content,
  .navigation-item,
  .round-button,
  .logout-button {
    transition:
      background-color 160ms,
      border-color 160ms,
      color 160ms;
  }
  .menu-toggle svg {
    transition: transform 160ms;
  }
}
</style>