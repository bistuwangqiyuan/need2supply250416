# 供需双方需求对接平台需求分析文档

## 1. 项目概述

### 1.1 项目背景
本项目旨在开发一个现代化的供需对接平台，致力于解决供需双方信息不对称的问题，提供一个高效、便捷的需求发布和对接平台。项目采用简单的技术框架，确保系统的可维护性和可扩展性。

### 1.2 项目目标
- 建立一个用户友好的需求发布平台
- 实现需求信息的高效采集和管理
- 提供完整的需求对接流程
- 确保数据的可视化展示和统计分析
- 建立完善的用户权限管理体系

## 2. 用户角色定义

### 2.1 普通用户（需求发布方）
- 可以发布需求信息
- 管理自己发布的需求
- 查看需求对接状态
- 与对接方进行沟通
- 查看数据统计和分析

### 2.2 管理员
- 系统管理和维护
- 用户管理
- 需求信息审核
- 数据统计和分析
- 平台运营管理

## 3. 功能需求

### 3.1 用户认证与授权
- 用户注册
- 用户登录
- 密码重置
- 个人信息管理
- 权限控制

### 3.2 需求发布管理
- 需求信息录入
  - 需求标题
  - 需求描述
  - 需求类别
  - 预算范围
  - 时间要求
  - 联系方式
- 需求编辑
- 需求下架
- 需求状态更新

### 3.3 需求展示
- 需求列表展示
- 需求详情页
- 需求搜索
- 需求筛选
- 需求分类浏览
- 需求分类浏览
- 每个需求展示页面，均有ai推荐按钮，点击后通过ai技术，实现根据我发布的资源智能推荐需求的功能。

### 3.4 资源发布与管理
- 资源信息录入
  - 资源标题
  - 资源描述
  - 资源类别
  - 联系方式
- 资源编辑
- 资源下架
- 资源状态更新

### 3.5 资源展示
- 资源列表展示
- 资源详情页
- 资源搜索
- 资源筛选
- 资源分类浏览

### 3.5 需求对接流程
- 对接申请
- 对接状态跟踪
- 对接进度管理
- 对接结果反馈

### 3.6 数据统计与可视化
- 需求发布统计
- 对接成功率统计
- 用户活跃度分析
- 需求类别分布
- 数据报表导出

### 3.7 用户反馈系统
- 评价打分
- 意见反馈
- 问题报告
- 客服支持

## 4. 技术方案

### 4.1 前端技术栈
- HTML5
- CSS3
- JavaScript
- 响应式设计
- 主流浏览器兼容

### 4.2 后端技术栈
- Node.js
- Express框架
- Supabase云数据库
  - PostgreSQL数据库服务
  - 实时数据订阅
  - 数据自动备份
- Supabase认证服务
  - 用户注册登录
  - 社交媒体登录集成
  - JWT令牌管理
  - 密码重置
  - 邮件验证
- Supabase存储服务
  - 文件上传和下载
  - 文件访问权限控制
  - 文件元数据管理
  - 大文件支持
  - 文件预览和缓存
- RESTful API设计

### 4.3 AI技术集成
- Deepseek API集成
  - 需求智能分析
    - 需求文本理解和分类
    - 关键信息提取
    - 需求完整性检查
  - 智能需求匹配
    - 相似需求推荐
    - 供需双方智能匹配
    - 匹配度评分
  - 数据分析和预测

### 4.4 配置

- VITE_SUPABASE_URL=https://smbksxmlfxfiohahdeqv.supabase.co
- VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYmtzeG1sZnhmaW9oYWhkZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODA3MjQsImV4cCI6MjA1OTk1NjcyNH0.9bpNQPeMdzvlnUT0yvWscr4rwfbWxOiHa4tUNhDQhVQ
- VITE_DEEPSEEK_API_KEY=sk-e112a65366474a46b49601d33953aee0