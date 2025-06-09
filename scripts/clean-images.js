const fs = require('fs/promises');
const path = require('path');

const IMAGE_DIR = './public/images/feishu';
const MAX_AGE_DAYS = 7; // 7天后清理

async function cleanOldImages() {
  try {
    console.log('🧹 开始清理过期图片...');
    
    const files = await fs.readdir(IMAGE_DIR);
    const now = Date.now();
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000; // 转换为毫秒
    
    let cleanedCount = 0;
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(IMAGE_DIR, file);
      
      try {
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          cleanedCount++;
          totalSize += stats.size;
          console.log(`🗑️  删除过期图片: ${file} (${(stats.size / 1024).toFixed(2)}KB)`);
        }
      } catch (error) {
        console.error(`❌ 处理文件 ${file} 时出错:`, error.message);
      }
    }
    
    console.log(`✅ 清理完成！删除了 ${cleanedCount} 个文件，释放空间 ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    
  } catch (error) {
    console.error('❌ 清理图片时出错:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  cleanOldImages();
}

module.exports = { cleanOldImages }; 