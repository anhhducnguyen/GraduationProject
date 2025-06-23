const { createClient } = require('redis');

const client = createClient();

client.on('error', (err) => console.log('❌ Redis Client Error:', err));


(async () => {
  await client.connect();

  // Ghi dữ liệu
  await client.set('mykey', 'Hello Redis');

  // Đọc dữ liệu
  const value = await client.get('mykey');
  console.log('📦 Value from Redis:', value);

  // Thêm dữ liệu dạng hash
  await client.hSet('user:1', {
    name: 'Anh Duc',
    job: 'Developer',
    age: 25,
  });

  // Lấy lại dữ liệu hash
  const user = await client.hGetAll('user:1');
  console.log('👤 User data:', user);

  await client.quit();
})();
