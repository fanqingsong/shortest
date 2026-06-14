#!/bin/bash

# 加载环境变量并运行 GLM 测试

echo "🔍 加载环境变量..."
export $(cat .env.local | grep -v '^#' | grep ZHIPU_API_KEY | xargs)
export $(cat .env.local | grep -v '^#' | grep TEST_USERNAME | xargs)
export $(cat .env.local | grep -v '^#' | grep TEST_PASSWORD | xargs)

echo "✅ 环境变量已加载"
echo "   - ZHIPU_API_KEY: ${ZHIPU_API_KEY:0:10}..."
echo "   - TEST_USERNAME: $TEST_USERNAME"
echo ""

echo "🚀 运行 GLM 测试..."
node ../packages/shortest/dist/cli/bin.js "$@"

echo ""
echo "✅ 测试完成"
