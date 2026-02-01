#!/usr/bin/env node
/**
 * 测试 OpenClaw Skill 导出
 */

const skillPath = process.env.HOME + '/.openclaw/workspace/skills/xiaohongshu-auto-publish/index.js';

console.log('测试 Skill 导出...\n');

// 动态导入 skill
import(skillPath).then((skill) => {
  console.log('✅ Skill 导出成功\n');
  console.log('导出内容:', JSON.stringify(skill, null, 2).slice(0, 500));

  // 测试 tools() 方法
  if (typeof skill.tools === 'function') {
    console.log('\n✅ tools 方法存在');
    skill.tools().then(tools => {
      console.log('工具列表:', tools.map(t => t.name).join(', '));
    });
  } else {
    console.log('\n❌ tools 方法不存在');
  }

  // 测试 call() 方法
  if (typeof skill.call === 'function') {
    console.log('\n✅ call 方法存在');
  } else {
    console.log('\n❌ call 方法不存在');
  }

  // 测试 onLoad() 方法
  if (typeof skill.onLoad === 'function') {
    console.log('\n✅ onLoad 方法存在');
  } else {
    console.log('\n⚠️  onLoad 方法不存在（可选）');
  }

}).catch((error) => {
  console.error('❌ Skill 导出失败:', error.message);
  console.error('\n错误详情:', error);
});
