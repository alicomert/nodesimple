const http = require('http');
const axios = require('axios');
const moment = require('moment-timezone');
const https = require('https');

// Telegram mesaj gönderme fonksiyonu
async function sendTelegramMessage(chatId, text) {
  const telegramAPI = `https://api.telegram.org/bot6624881831:AAGeAR9ZULEZzcWOjYI3zBH03xUQxeVKBHY/sendMessage`;
  try {
    await axios.post(telegramAPI, { chat_id: chatId, text: text });
  } catch (error) {
    console.error('Telegram mesajı gönderilirken hata oluştu:', error);
  }
}

// Zaman aralığını kontrol eden fonksiyon
function checkTimeWindow(schedule) {
  if (!schedule.start || !schedule.end) return true;
  const now = moment().tz('Europe/Istanbul');
  const startTime = moment().tz('Europe/Istanbul').set({ hour: schedule.start.split(':')[0], minute: schedule.start.split(':')[1], second: 0 });
  const endTime = moment().tz('Europe/Istanbul').set({ hour: schedule.end.split(':')[0], minute: schedule.end.split(':')[1], second: 0 });
  return now.isBetween(startTime, endTime);
}

// URL'den veri çekme fonksiyonu
async function fetchUrl(url, schedule) {
  if (checkTimeWindow(schedule)) {
    try {
      console.log(`${url} üzerinden veri çekiliyor...`);
      const agent = new https.Agent({ rejectUnauthorized: false });
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        timeout: 10000,
        httpsAgent: agent
      });
      console.log(response.data);
    } catch (error) {
      console.error('Hata:', error);
      sendTelegramMessage(930115244, `Link problem: ${url}`);
    }
    await new Promise(resolve => setTimeout(resolve, schedule.delay || 0));
  }
}

// Zamanlama ile veri çekme fonksiyonu
async function fetchDataWithTiming(urls, schedules) {
  const fetchPromises = urls.map((url, index) => {
    const schedule = schedules[index];
    return (async () => {
      while (true) {
        await fetchUrl(url, schedule);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    })();
  });
  await Promise.all(fetchPromises);
}

// URL listesi
const urls = [
  'https://api.borsify.com/image/img.php',
  'https://finansliyorum.com/sitemap.php',
  'https://borsify.com/oto/savepn.php',
  'https://borsify.com/oto/saveteknik.php',
  'https://borsify.com/oto/savemumveri.php',
  'https://borsify.com/oto/hissebist.php',
  'https://borsify.com/signal/girisoto.php'
];

// Zamanlama ayarları
const schedules = [
  { start: '10:20', end: '11:00', delay: 0 },
  { delay: 86400000 },
  { start: '09:57', end: '18:55', delay: 7000 },
  { start: '09:57', end: '18:55', delay: 7000 },
  { start: '09:55', end: '18:55', delay: 0 },
  { start: '09:55', end: '18:55', delay: 60000 },
  { start: '20:00', end: '22:00', delay: 120000 },

];

// Telegram'a belirli aralıklarla mesaj gönderme
setInterval(() => {
  sendTelegramMessage(930115244, 'Node.js aktif');
}, 1800000);

// Veri çekme işlemini başlat
fetchDataWithTiming(urls, schedules);

// HTTP sunucusu oluştur
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Node.js uygulaması çalışıyor\n');
});

server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor...`);
});
