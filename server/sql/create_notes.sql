-- notes 建表学习脚本：2026-11-16 学生已执行，实际表结构已只读核对。
-- 已包含 user_id → users.id 外键；文件夹阶段再补 folder_id 关联约束。

CREATE TABLE notes (
  -- 每篇笔记自己的编号。
  id INT NOT NULL AUTO_INCREMENT,

  -- 所属用户编号，与现有 users.id 一样使用有符号 INT，不自增。
  user_id INT NOT NULL,

  -- NULL 表示根目录；文件夹阶段再补关联约束。
  folder_id INT DEFAULT NULL,

  title VARCHAR(200) NOT NULL,
  -- 正文可保存空字符串，支持先创建空笔记再编辑。
  content MEDIUMTEXT NOT NULL,

  -- 为后续版本检查预留；有字段不代表已实现冲突处理。
  version INT NOT NULL DEFAULT 1,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- 把 id 列设为这张表的主键，用它唯一识别每一条记录。即每篇笔记的编号
  PRIMARY KEY (id),
  -- 给这条规则起的名字
  -- 规则就是最下面一行：即两句话执行的效果——笔记的 user_id 必须对应一个已经存在的用户。
  CONSTRAINT fk_notes_user
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
