@echo off
REM AI Hub 后端快速启动脚本 (Windows)

echo 🚀 AI Hub 后端启动脚本
echo ==========================

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查 npm 是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 未安装，请先安装 npm
    pause
    exit /b 1
)

REM 检查是否存在 .env 文件
if not exist .env (
    echo 📝 创建环境变量文件...
    copy env.example .env
    echo ✅ 已创建 .env 文件，请编辑其中的数据库配置
    echo    然后重新运行此脚本
    pause
    exit /b 1
)

REM 安装依赖
echo 📦 安装依赖包...
npm install

echo 🎉 环境检查完成，启动服务器...
echo 📡 API 服务器将在 http://localhost:3000 启动
echo 📚 API 文档请查看 README.md
echo.
echo 按 Ctrl+C 停止服务器
echo ==========================
echo.

REM 启动服务器
npm run dev

pause
