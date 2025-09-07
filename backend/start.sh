#!/bin/bash

# AI Hub 后端快速启动脚本

echo "🚀 AI Hub 后端启动脚本"
echo "=========================="

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 检查 MySQL 是否运行
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL 未安装，请先安装 MySQL"
    echo "   或者使用 Docker 运行数据库"
fi

# 检查是否存在 .env 文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "✅ 已创建 .env 文件，请编辑其中的数据库配置"
    echo "   然后重新运行此脚本"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖包..."
npm install

# 检查数据库连接
echo "🔍 检查数据库连接..."
node -e "
const db = require('./config/db');
db.execute('SELECT 1')
  .then(() => {
    console.log('✅ 数据库连接成功');
    process.exit(0);
  })
  .catch((err) => {
    console.log('❌ 数据库连接失败:', err.message);
    console.log('请检查数据库配置和 MySQL 服务状态');
    process.exit(1);
  });
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 环境检查完成，启动服务器..."
    echo "📡 API 服务器将在 http://localhost:3000 启动"
    echo "📚 API 文档请查看 README.md"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=========================="
    
    # 启动服务器
    npm run dev
else
    echo "❌ 环境检查失败，请修复问题后重试"
    exit 1
fi
