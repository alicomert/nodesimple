const http = require('http');
const axios = require('axios');
const moment = require('moment-timezone'); // İstanbul zaman dilimi için

async function sendTelegramMessage(chatId, text) {
  const telegramAPI = `https://api.telegram.org/bot6624881831:AAGeAR9ZULEZzcWOjYI3zBH03xUQxeVKBHY/sendMessage`;
  try {
    await axios.post(telegramAPI, {
      chat_id: chatId,
      text: text,
    });
  } catch (error) {
    console.error('Telegram mesajı gönderilirken hata oluştu:', error);
  }
}

function checkTimeWindow(schedule) {
  if (!schedule.start || !schedule.end) {
    return true;
  }

  const now = moment().tz('Europe/Istanbul'); // Şu anki zaman İstanbul'a göre
  const startTime = schedule.start.split(':').map(Number);
  const endTime = schedule.end.split(':').map(Number);
  
  const startDate = moment().tz('Europe/Istanbul').set({ hour: startTime[0], minute: startTime[1], second: 0 });
  const endDate = moment().tz('Europe/Istanbul').set({ hour: endTime[0], minute: endTime[1], second: 0 });

  return now.isBetween(startDate, endDate);
}

async function fetchUrl(url, schedule) {
  if (checkTimeWindow(schedule)) {
    try {
      console.log(`${url} üzerinden veri çekiliyor...`);
      const response = await axios.get(url);
      console.log(response.data);
    } catch (error) {
      console.error('Hata:', error);
      sendTelegramMessage(930115244, `Link problem: ${url}`);
    }
    await new Promise(resolve => setTimeout(resolve, schedule.delay || 0));
  }
}

async function fetchDataWithTiming(urls, schedules) {
  const fetchPromises = urls.map((url, index) => {
    const schedule = schedules[index];
    return (async () => {
      while (true) {
        await fetchUrl(url, schedule);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Her URL için bekleme süresi
      }
    })();
  });

  await Promise.all(fetchPromises);
}

const urls = [
  'https://api.borsify.com/image/img.php',
  'https://api.borsify.com/sinyal/sinyalyeni.php',
  'https://api.borsify.com/sinyal/sinyalcontrol.php',
  'https://api.borsify.com/sinyal/sinyalold.php',
  'https://api.borsify.com/datasave/datasave.php',
  'https://api.borsify.com/sinyal/sinyal_dongu.php',
  'https://finansliyorum.com/sitemap.php',
  'https://borsify.com/api/eskisinyal.php',
  'https://borsify.com/api/savepn.php',
  'https://borsify.com/api/saveteknik4h.php',
'https://borsify.com/oto/kap.php',
];

const schedules = [
  { start: '10:20', end: '11:00', delay: 0 },
  { start: '20:35', end: '22:30', delay: 0 },
  { start: '20:35', end: '22:30', delay: 0 },
  { start: '20:35', end: '22:30', delay: 0 },
  { start: '09:55', end: '18:55', delay: 10000 },
  { start: '20:29', end: '20:30', delay: 20000 },
  { delay: 86400000 },
  { start: '21:00', end: '22:30', delay: 60000 },
  { start: '09:57', end: '18:55', delay: 7000 },
  { start: '09:57', end: '18:55', delay: 7000 },
{ delay: 10000 },


];

// Yarım saatte bir Telegram'a "Node.js aktif" mesajı gönder
setInterval(() => {
  sendTelegramMessage(930115244, 'Node.js aktif');
}, 1800000); // 1800000 ms = 30 dakika

fetchDataWithTiming(urls, schedules);

// HTTP sunucusu oluştur ve belirli bir portta dinle
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Node.js uygulaması çalışıyor\n');
});

server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda dinleniyor...`);
});
