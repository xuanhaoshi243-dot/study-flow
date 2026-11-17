<template>
  <main class="notes-page">
    <header class="notes-header">
      <div>
        <h1>我的笔记</h1>
        <p class="notes-description">记录想法，整理每一次学习。</p>
      </div>
      <div class="notes-actions">
        <button class="notes-button" type="button" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5" />
          </svg>
          导出
        </button>
        <button class="notes-button notes-button-primary" type="button" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          新建笔记
        </button>
      </div>
    </header>

    <!-- 快速记录仅为静态样式，输入绑定、图片/文件插入、清空及保存由后续练习实现。 -->
    <section class="quick-note" aria-labelledby="quick-note-label">
      <div class="quick-note-heading">
        <label id="quick-note-label" for="quick-note-content">快速记录</label>
        <span class="sample-label">静态预览</span>
      </div>
      <textarea
        id="quick-note-content"
        class="quick-note-input"
        rows="7"
        placeholder="写下此刻的想法…"
        v-model="quickNoteContent"
      ></textarea>
      <div class="quick-note-tools">
        <span class="quick-note-destination">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 3h14v18H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM6 3v18M10 8h6M10 12h4" />
          </svg>
          全部笔记
        </span>
        <div class="quick-note-utilities">
          <button class="notes-button" type="button" disabled>插入图片</button>
          <button class="notes-button" type="button" disabled>插入文件</button>
          <button class="notes-button" type="button" @click="quickNoteContent = ''" :disabled="quickNoteContent.length === 0">清空</button>
        </div>
      </div>
      <div class="quick-note-actions">
        <button class="notes-button quick-note-editor" type="button" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          打开笔记编辑器
        </button>
        <button class="notes-button notes-button-primary quick-note-submit" type="button" disabled>
          提交到笔记库
        </button>
      </div>
    </section>

    <!-- 工具栏仅展示样式，后面再学习输入绑定和点击事件。 -->
    <div class="notes-toolbar">
      <button class="notes-button notes-folder" type="button" disabled>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h7l2 2h9v12H3ZM3 6V4h7l2 2h9v2" />
        </svg>
        全部文件夹
        <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
      </button>
      <label class="notes-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <span class="visually-hidden">搜索笔记</span>
        <input type="search" placeholder="搜索笔记标题或内容…" disabled />
      </label>
    </div>

    <div class="notes-list-heading">
      <div class="notes-list-summary">
        <span>{{ notes.length }} 篇示例笔记</span><span class="sample-label">示例内容</span>
      </div>
      <span class="notes-sort">最近更新 <span aria-hidden="true">↓</span></span>
    </div>

    <!-- 以下都是写死的示例，不是数据库数据。后面由你用数组和 v-for 替换。 -->
    <section class="notes-grid" aria-label="笔记列表示例" v-if="notes.length !== 0">
      <article class="note-card" v-for="note in notes" :key="note.id">
        <div class="note-card-top">
          <span class="note-document" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M14 3H5v18h14V8ZM14 3v5h5M8 12h8M8 16h5" /></svg>
          </span>
          <button
            class="note-favorite"
            :class="{'is-favorite': note.isFavorite}"
            type="button"
            disabled
            :aria-label="note.isFavorite ? '已收藏（示例）' : '未收藏（示例）'"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"
              />
            </svg>
          </button>
        </div>
        <h2>{{ note.title }}</h2>
        <p class="note-summary">
          {{ note.summary }}
        </p>
        <footer class="note-card-footer">
          <span class="note-folder-name">{{ note.folderName }}</span>
          <time :datetime="note.updatedAt">{{ formatDate(note.updatedAt) }}</time>
        </footer>
      </article>

      
    </section>

    <!-- 暂用原生 hidden 隐藏空状态；列表与空状态的条件渲染留给后续练习。 -->
    <section class="notes-empty" aria-label="笔记空状态" v-else>
      <span class="empty-illustration" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M6 3h14v18H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM6 3v18M10 8h6M10 12h4" />
        </svg>
      </span>
      <h2>还没有笔记</h2>
      <p>创建第一篇笔记，开始记录你的学习。</p>
      <button class="notes-button notes-button-primary" type="button" disabled>
        新建第一篇笔记
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
  import {ref} from 'vue'

  const quickNoteContent = ref('')
  const notes = ref([{
    id: 1, 
    title: 'vue响应式',
    summary: '记录 ref 的使用方法',
    folderName: 'Vue',
    isFavorite: true,
    updatedAt: '2026-11-15T10:20:00+08:00',
  }, {
    id: 2, 
    title: 'js八股',
    summary: 'js基础知识梳理', 
    folderName: 'JS',
    isFavorite: true,
    updatedAt: '2026-11-14T16:40:00+08:00',
  },  {
    id: 3, 
    title: '异步请求的状态竞争',
    summary: '前端竞态问题',
    folderName: 'JS',
    isFavorite: true,
    updatedAt: '2026-11-13T20:15:00+08:00',
  }, {
    id: 4, 
    title: 'vue2',
    summary: 'vue2基础',
    folderName: 'Vue',
    isFavorite: false,
    updatedAt: '2026-11-12T09:30:00+08:00',
  }])

  // 示例数据保留带时区的完整时间，显示时按浏览器本地时区转换。
  function formatDate(value: string) {
    return new Date(value).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }
</script>

<style scoped>
.notes-page {
  min-width: 0;
}
.notes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}
h1,
h2,
p {
  margin: 0;
}
.notes-page .notes-header h1 {
  margin-bottom: 0;
  color: var(--sf-text);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.notes-description {
  margin-top: 6px;
  color: var(--sf-text-secondary);
  font-size: 14px;
}
.notes-actions {
  display: flex;
  gap: 10px;
}
svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.notes-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 9px 14px;
  border: 1px solid var(--sf-border);
  border-radius: 12px;
  background: var(--sf-surface);
  color: var(--sf-text);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
}
.notes-button:disabled,
.note-favorite:disabled,
input:disabled {
  cursor: not-allowed;
}
.notes-button-primary {
  border-color: var(--sf-text);
  background: var(--sf-text);
  color: var(--sf-surface);
}
.quick-note {
  margin-top: 28px;
  padding: 24px;
  border: 1px solid var(--sf-border);
  border-radius: 20px;
  background: var(--sf-background);
}
.quick-note-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  color: var(--sf-text-secondary);
  font-size: 14px;
}
.quick-note-heading label {
  color: var(--sf-text);
  font-weight: 600;
}
.quick-note-input {
  display: block;
  width: 100%;
  min-height: 200px;
  padding: 18px 20px;
  resize: vertical;
  border: 1px solid var(--sf-border);
  border-radius: 14px;
  background: var(--sf-surface);
  color: var(--sf-text);
  box-shadow: 0 2px 4px rgb(0 0 0 / 3%);
  font: inherit;
  font-size: 15px;
  line-height: 1.8;
  opacity: 1;
  cursor: text;
}
.quick-note-input::placeholder {
  color: var(--sf-text-secondary);
  opacity: 1;
}
.quick-note-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}
.quick-note-destination {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--sf-text-secondary);
  font-size: 12px;
}
.quick-note-destination svg {
  width: 16px;
  height: 16px;
}
.quick-note-utilities {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  max-width: 100%;
  margin-left: auto;
}
.quick-note-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.quick-note-actions .notes-button {
  min-height: 46px;
  font-size: 14px;
}
.quick-note-editor {
  flex-shrink: 0;
}
.quick-note-submit {
  flex: 1;
}
.notes-toolbar {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}
.notes-folder {
  flex-shrink: 0;
}
.chevron {
  width: 14px;
  height: 14px;
  margin-left: 8px;
}
.notes-search {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 10px;
  min-width: 0;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--sf-border);
  border-radius: 12px;
  background: var(--sf-soft);
  color: var(--sf-text-secondary);
}
.notes-search input {
  width: 100%;
  min-width: 0;
  padding: 10px 0;
  border: 0;
  background: transparent;
  color: var(--sf-text);
  font: inherit;
  font-size: 13px;
  opacity: 1;
}
.notes-search input::placeholder {
  color: var(--sf-text-secondary);
  opacity: 1;
}
.notes-list-heading {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 25px 0 14px;
  color: var(--sf-text-secondary);
  font-size: 12px;
}
.notes-list-summary {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sample-label {
  padding: 3px 7px;
  border-radius: 6px;
  background: var(--sf-soft);
  font-size: 11px;
}
.notes-sort {
  display: flex;
  gap: 6px;
}
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.note-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 238px;
  padding: 20px;
  border: 1px solid var(--sf-border);
  border-radius: 16px;
  background: var(--sf-surface);
}
.note-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.note-document {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: var(--sf-selected);
  color: var(--sf-accent);
}
.note-favorite {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--sf-text-secondary);
}
.note-favorite.is-favorite {
  color: var(--sf-accent);
}
.note-favorite.is-favorite svg {
  fill: var(--sf-selected);
}
.note-card h2 {
  color: var(--sf-text);
  font-size: 16px;
  line-height: 1.6;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.note-summary {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  margin-top: 9px;
  color: var(--sf-text-secondary);
  font-size: 13px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}
.note-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 24px;
  color: var(--sf-text-secondary);
  font-size: 11px;
}
.note-folder-name {
  max-width: 100%;
  padding: 3px 7px;
  border-radius: 6px;
  background: var(--sf-soft);
  overflow-wrap: anywhere;
}
.notes-empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 12px;
  padding: 72px 16px;
  text-align: center;
}
.notes-empty[hidden] {
  display: none;
}
.empty-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: 8px;
  border-radius: 22px;
  background: var(--sf-soft);
  color: var(--sf-text-secondary);
}
.empty-illustration svg {
  width: 32px;
  height: 32px;
}
.notes-empty h2 {
  color: var(--sf-text);
  font-size: 18px;
  font-weight: 600;
}
.notes-empty p {
  color: var(--sf-text-secondary);
  font-size: 13px;
  line-height: 1.8;
}
.notes-empty .notes-button {
  margin-top: 10px;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (max-width: 640px) {
  .notes-page .notes-header h1 {
    font-size: 22px;
  }
  .notes-header {
    gap: 16px;
  }
  .quick-note {
    margin-top: 22px;
    padding: 16px;
    border-radius: 16px;
  }
  .quick-note-input {
    min-height: 180px;
    padding: 14px;
    font-size: 14px;
  }
  .quick-note-actions {
    flex-direction: column;
    gap: 10px;
  }
  .notes-toolbar {
    flex-wrap: wrap;
    margin-top: 22px;
  }
  .notes-search {
    flex-basis: 100%;
  }
  .notes-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .note-card {
    min-height: 220px;
    padding: 18px;
  }
  .notes-empty {
    padding: 48px 8px;
  }
}
</style>
