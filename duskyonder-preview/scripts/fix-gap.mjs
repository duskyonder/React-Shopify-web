import mysql from 'mysql2/promise';

const url = 'mysql://2DfbGrR5GmTu2ut.root:W2hffTJ05ITjOY9bEp50@gateway03.us-east-1.prod.aws.tidbcloud.com:4000/apEwHNU9kEqfqS6bDGfKjk?ssl={"rejectUnauthorized":true}';

const conn = await mysql.createConnection(url);
const [[row]] = await conn.query('SELECT configValue FROM theme_config WHERE configKey = ?', ['themeConfig']);
const cfg = JSON.parse(row.configValue);

// Fix productsDesktopGap
cfg.productsDesktopGap = 20;

// Also fix all featuredInstances that may have gap 0 (they inherit from config, not stored separately)
await conn.query(
  'UPDATE theme_config SET configValue = ? WHERE configKey = ?',
  [JSON.stringify(cfg), 'themeConfig']
);
console.log('Updated productsDesktopGap to', cfg.productsDesktopGap);
await conn.end();
