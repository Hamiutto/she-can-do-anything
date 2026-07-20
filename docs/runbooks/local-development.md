# 本地开发运行手册

> 更新时间：2026-07-20

项目本地开发需要同时启动后端和前端。前端通过 Vite 代理访问后端 API。

## 前置要求

| 依赖 | 建议 |
|------|------|
| Node.js | 18.x 或兼容 Vite 5 的版本 |
| npm | 随 Node.js 安装 |

## 安装依赖

前端依赖：

```powershell
npm install
```

后端依赖：

```powershell
Set-Location backend
npm install
```

## 启动服务

终端 1，启动后端：

```powershell
Set-Location backend
npm run dev
```

后端默认监听：`http://localhost:3001`。

终端 2，启动前端：

```powershell
npm run dev
```

前端默认监听：`http://localhost:8887`。

## 常用命令

| 位置 | 命令 | 说明 |
|------|------|------|
| 根目录 | `npm run dev` | 启动前端开发服务器 |
| 根目录 | `npm run build` | 构建前端产物 |
| 根目录 | `npm run preview` | 预览构建产物 |
| `backend/` | `npm start` | 启动后端 |
| `backend/` | `npm run dev` | watch 模式启动后端 |

## 健康检查

后端启动后可访问：

```text
http://localhost:3001/api/health
```

预期返回包含：

```json
{
  "status": "ok"
}
```

## 端口说明

| 端口 | 服务 | 配置位置 |
|------|------|----------|
| 8887 | Vite 前端 | `vite.config.js` |
| 3001 | 后端 API | `backend/src/app.js` |

如果修改后端端口，需要同步修改 `vite.config.js` 中 `/api` 的 `target`。

## 常见问题

### 后端端口 3001 被占用

PowerShell 查看占用：

```powershell
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
```

找到进程后可用任务管理器结束，或换一个后端端口并同步修改 Vite 代理。

### 前端 API 请求失败

检查三件事：

1. 后端是否已启动。
2. `http://localhost:3001/api/health` 是否返回正常。
3. `vite.config.js` 的代理目标是否仍是后端实际端口。

### 登录态异常

前端 token 存在浏览器 `localStorage`。如果本地调试中用户状态混乱，可以清空浏览器站点数据后重新登录。

### 粒子页面没有问题

粒子页面读取 `/api/questions` 中待回答问题。若为空，可以先到 `/qa-square` 公开提问，或检查 `backend/data/questions.json` 是否存在待回答问题。
