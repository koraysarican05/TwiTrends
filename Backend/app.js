const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const axios = require('axios');
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/report_files', express.static(path.join(__dirname, 'report_files')));

const config = {
  user: 'sa',
  password: '1234Koray!',
  server: '127.0.0.1\\SQLEXPRESS',
  port: 1433,
  database: 'TwiTrends_1',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

function extractHashtags(text) {
  const regex = /#(\w+)/g;
  const hashtags = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    hashtags.push(match[1]);
  }
  return hashtags;
}

async function resetDatabase() {
  try {
    await sql.connect(config);
    console.log("🧹 Veritabanı sıfırlanıyor...");
    await sql.query(`DELETE FROM TweetHashtags`);
    await sql.query(`DELETE FROM Hashtags`);
    await sql.query(`DELETE FROM Tweets`);
    console.log("✅ Veritabanı temizlendi.");
  } catch (err) {
    console.error("❌ Veritabanı temizlenirken hata:", err);
  }
}

async function fixHashtagsFromExistingTweets() {
  try {
    await sql.connect(config);
    console.log("🔄 Eski tweetlerde hashtag taraması başlatıldı...");
    const tweets = await sql.query`SELECT tweet_id, content FROM dbo.Tweets`;
    for (const tweet of tweets.recordset) {
      const hashtags = extractHashtags(tweet.content);
      for (const tag of hashtags) {
        await sql.query`
          IF NOT EXISTS (SELECT 1 FROM Hashtags WHERE hashtag = ${tag})
          BEGIN
            INSERT INTO Hashtags (hashtag) VALUES (${tag})
          END
        `;
        const idResult = await sql.query`
          SELECT hashtag_id FROM Hashtags WHERE hashtag = ${tag}
        `;
        const hashtagId = idResult.recordset[0].hashtag_id;
        await sql.query`
          IF NOT EXISTS (
            SELECT 1 FROM TweetHashtags
            WHERE tweet_id = ${tweet.tweet_id} AND hashtag_id = ${hashtagId}
          )
          BEGIN
            INSERT INTO TweetHashtags (tweet_id, hashtag_id)
            VALUES (${tweet.tweet_id}, ${hashtagId})
          END
        `;
      }
    }
    console.log("✅ Hashtag düzeltmesi tamamlandı.");
  } catch (err) {
    console.error("❌ fixHashtagsFromExistingTweets Hatası:", err);
  }
}


async function fetchTweets(keyword) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('keyword', sql.VarChar, keyword)
      .query(`
        SELECT tweet_date, sentiment, content
        FROM Tweets
        WHERE content LIKE '%' + @keyword + '%'  -- Keyword filtresi
        ORDER BY tweet_date DESC
      `);

    return result.recordset;  
  } catch (err) {
    console.error("Tweetler alınamadı:", err);
    throw new Error("Error fetching tweets");
  }
}

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const createPdf = require('pdfkit');

async function generateReport(tweets, keyword) {
  const now = Date.now();
  const cleanedKeyword = keyword.replace(/[^\w\s]/gi, ''); 
  const reportFilePathCsv = path.join(__dirname, 'report_files', `report_${cleanedKeyword}.csv`);
  const reportFilePathPdf = path.join(__dirname, 'report_files', `report_${cleanedKeyword}.pdf`);

  // **CSV Raporu Oluşturma**
  const csvWriter = createCsvWriter({
    path: reportFilePathCsv,
    header: [
      { id: 'tweet_date', title: 'Tarih' },
      { id: 'sentiment', title: 'Duygu' },
      { id: 'username', title: 'Kullanıcı Adı' },
      { id: 'content', title: 'Tweet İçeriği' }
    ]
  });

  
  const cleanedTweets = tweets.map(tweet => ({
    tweet_date: tweet.tweet_date,
    sentiment: tweet.sentiment,
    username: tweet.username,
    content: tweet.content.replace(/\n/g, ' ').replace(/\r/g, '').replace(/["']/g, ''),
  }));

  
  await csvWriter.writeRecords(cleanedTweets);

 
  const pdfDoc = new createPdf();
  pdfDoc.pipe(fs.createWriteStream(reportFilePathPdf));

  
  pdfDoc.registerFont('DejaVu', 'C:/TwiFonts/DejaVuSans.ttf');
  
 
  pdfDoc.font('DejaVu').fontSize(18).text(`Rapor: ${cleanedKeyword}`, { align: 'center' });
  pdfDoc.moveDown(2);

  
  pdfDoc.font('DejaVu').fontSize(12).font('Helvetica-Bold')
         .text('Tarih', { continued: true, width: 150, align: 'left' })
         .text('Duygu', { continued: true, width: 100, align: 'left' })
         .text('Kullanıcı Adı', { continued: true, width: 150, align: 'left' })
         .text('Tweet İçeriği', { width: 300, align: 'left' });
  pdfDoc.moveDown();

  
  pdfDoc.font('DejaVu').fontSize(10);

  tweets.forEach(tweet => {
    pdfDoc.text(`${tweet.tweet_date}`, { continued: true, width: 150, align: 'left' })
           .text(`${tweet.sentiment}`, { continued: true, width: 100, align: 'left' })
           .text(`${tweet.username}`, { continued: true, width: 150, align: 'left' })
           .text(`${tweet.content}`, { width: 300, align: 'left' });
    pdfDoc.moveDown();
  });

  pdfDoc.end();

 
  return {
    csvPath: reportFilePathCsv,
    pdfPath: reportFilePathPdf
  };
}





app.post('/api/scrape', async (req, res) => {
  const { keyword, startDate, endDate, user_id } = req.body;

  
  if (!keyword || !startDate || !endDate || !user_id) {
    return res.status(400).json({ error: 'Keyword, startDate, endDate ve user_id gereklidir.' });
  }

  const pythonScriptPath = path.join(__dirname, "../twi-scraper/full_scraper.py");

  
  const scraper = spawn('python', [pythonScriptPath, keyword, startDate, endDate, user_id]);

  
  scraper.stdout.on('data', (data) => {
    console.log(`[SCRAPER]: ${data}`);
  });

  
  scraper.stderr.on('data', (data) => {
    console.error(`[SCRAPER ERROR]: ${data}`);
  });

  
  scraper.on('close', (code) => {
    if (code === 0) {
      res.status(200).json({ message: 'Scraping completed.' });
    } else {
      res.status(500).json({ error: 'Scraping process failed.' });
    }
  });
});


//Live tweets (user'a özel + arama kelimesine özel)
app.get("/api/tweets/live", async (req, res) => {
  const { user_id, search_keyword } = req.query;

  if (!user_id || !search_keyword) {
    return res.status(400).json({ error: "user_id ve search_keyword gereklidir." });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('user_id', sql.Int, parseInt(user_id))
      .input('search_keyword', sql.VarChar, search_keyword.toLowerCase()) 
      .query(`
        SELECT TOP 10 tweet_id, content, created_at, tweet_date
        FROM Tweets
        WHERE created_by_user_id = @user_id AND LOWER(search_keyword) = @search_keyword
        ORDER BY created_at DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Tweet verisi alınamadı:", err);
    res.status(500).json({ error: "Tweet verisi alınamadı" });
  }
});



//Tweet sentiment dağılımı (keyword ile filtreleme)
app.get('/api/tweets/sentiment-distribution', async (req, res) => {
  const { keyword } = req.query;  // keyword parametresi alınıyor
  if (!keyword) {
    return res.status(400).json({ error: "keyword gereklidir." });
  }

  try {
    await sql.connect(config);
    const result = await sql.query(`
      SELECT sentiment, COUNT(*) AS count
      FROM dbo.Tweets t
      JOIN SearchTweets st ON st.tweet_id = t.tweet_id
      JOIN SearchHistory sh ON st.search_id = sh.search_id
      WHERE sh.keyword = '${keyword}'  -- keyword filtresi ekleniyor
      GROUP BY sentiment
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL Error (Sentiment Distribution):', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get("/api/tweets/count-by-date", async (req, res) => {
  const { startDate, endDate, keyword } = req.query;
  if (!startDate || !endDate || !keyword) {
    return res.status(400).json({ error: "startDate, endDate ve keyword gereklidir." });
  }

  try {
    await sql.connect(config);
    const result = await sql.query(`
      WITH DateRange AS (
        SELECT CAST('${startDate}' AS DATE) AS [Date]
        UNION ALL
        SELECT DATEADD(DAY, 1, [Date])
        FROM DateRange
        WHERE DATEADD(DAY, 1, [Date]) <= CAST('${endDate}' AS DATE)
      )
      SELECT 
        DR.[Date] AS tweet_date,
        COUNT(T.tweet_id) AS tweet_count
      FROM DateRange DR
      LEFT JOIN Tweets T ON CAST(T.tweet_date AS DATE) = DR.[Date]
      LEFT JOIN SearchTweets ST ON ST.tweet_id = T.tweet_id
      LEFT JOIN SearchHistory SH ON ST.search_id = SH.search_id
      WHERE SH.keyword = '${keyword}'  -- Keyword filtresi burada
      GROUP BY DR.[Date]
      ORDER BY DR.[Date]
      OPTION (MAXRECURSION 1000);
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Tweet tarih verisi alınamadı:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//Trending hashtags
app.get('/api/tweets/trending-hashtags', async (req, res) => {
  const { keyword } = req.query;  
  if (!keyword) {
    return res.status(400).json({ error: "keyword gereklidir." });
  }

  try {
    await sql.connect(config);
    const result = await sql.query(`
      SELECT TOP 10 h.hashtag, COUNT(*) AS tweet_count
      FROM TweetHashtags th
      JOIN Hashtags h ON th.hashtag_id = h.hashtag_id
      JOIN Tweets t ON th.tweet_id = t.tweet_id
      JOIN SearchTweets st ON st.tweet_id = t.tweet_id
      JOIN SearchHistory sh ON st.search_id = sh.search_id
      WHERE t.created_at > DATEADD(day, -7, GETDATE())
        AND sh.keyword = '${keyword}'  -- keyword filtresi ekleniyor
      GROUP BY h.hashtag
      ORDER BY tweet_count DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Trending hashtag verisi alınamadı:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



//Tweet ekleme 
app.post('/api/tweets/add', async (req, res) => {
  const user_id = parseInt(req.body.user_id);
  let { content, tweet_date, keyword, start_date, end_date } = req.body;

  try {
    
    keyword = keyword.toLowerCase().trim();

    const response = await axios.post('http://127.0.0.1:8002/predict', { text: content });
    const sentiment = response.data.prediction;
    await sql.connect(config);

    const createdAt = new Date(Date.now() + 3 * 60 * 60 * 1000); 
    let formattedTweetDate = tweet_date;
    if (tweet_date) {
      formattedTweetDate = tweet_date.replace('T', ' ').replace('Z', '').slice(0, 19);
    }

    // Tweet ekle, varsa 409 gönder
    let tweetResult;
    try {
      tweetResult = await sql.query`
        INSERT INTO dbo.Tweets (content, tweet_date, created_at, sentiment, created_by_user_id, search_keyword)
        OUTPUT INSERTED.tweet_id
        VALUES (${content}, ${formattedTweetDate}, ${createdAt}, ${sentiment}, ${user_id}, ${keyword})  -- search_keyword ekleniyor
      `;
    } catch (insertErr) {
      if (insertErr.originalError?.info?.number === 2601 || insertErr.originalError?.info?.number === 2627) {
        return res.status(409).json({ message: "Tweet zaten mevcut, tekrar eklenmedi." });
      } else {
        throw insertErr;
      }
    }

    const tweetId = tweetResult.recordset[0].tweet_id;

    //HASHTAG işlemleri
    const hashtags = extractHashtags(content);
    for (const tag of hashtags) {
      await sql.query`
        IF NOT EXISTS (SELECT 1 FROM Hashtags WHERE hashtag = ${tag})
        BEGIN
          INSERT INTO Hashtags (hashtag) VALUES (${tag})
        END
      `;
      const idResult = await sql.query`
        SELECT hashtag_id FROM Hashtags WHERE hashtag = ${tag}
      `;
      const hashtagId = idResult.recordset[0].hashtag_id;
      await sql.query`
        IF NOT EXISTS (
          SELECT 1 FROM TweetHashtags
          WHERE tweet_id = ${tweetId} AND hashtag_id = ${hashtagId}
        )
        BEGIN
          INSERT INTO TweetHashtags (tweet_id, hashtag_id)
          VALUES (${tweetId}, ${hashtagId})
        END
      `;
    }

    
    let searchId = null;
    const existingSearch = await sql.query`
      SELECT TOP 1 search_id FROM SearchHistory
      WHERE LOWER(keyword) = LOWER(${keyword}) AND start_date = ${start_date} AND end_date = ${end_date}
      ORDER BY search_datetime DESC
    `;
    if (existingSearch.recordset.length > 0) {
      searchId = existingSearch.recordset[0].search_id;
    } else {
      const searchResult = await sql.query`
        INSERT INTO SearchHistory (keyword, start_date, end_date, report_filename, created_by_user_id)
        OUTPUT INSERTED.search_id
        VALUES (${keyword}, ${start_date}, ${end_date}, NULL, ${user_id})
      `;
      searchId = searchResult.recordset[0].search_id;
    }

   
    await sql.query`
      INSERT INTO SearchTweets (search_id, tweet_id)
      VALUES (${searchId}, ${tweetId})
    `;

    res.status(201).json({ message: 'Tweet ve sentiment eklendi.', tweetId, sentiment });

  } catch (err) {
    console.error("Tweet eklenemedi:", err.response?.data || err.message || err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






app.get('/api/tweets/word-cloud', async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: "startDate ve endDate gereklidir." });
  }

  try {
    await sql.connect(config);

    const result = await sql.query`
      SELECT content FROM dbo.Tweets
      WHERE CAST(tweet_date AS DATE) BETWEEN CAST(${startDate} AS DATE) AND CAST(${endDate} AS DATE)
    `;

    const allWords = {};
    const stopwords = new Set([
      "bir", "ve", "ile", "bu", "şu", "çok", "gibi", "de", "da", "için", "ama", "ne", "ya", "ben", "sen", "biz", "siz", "onlar",
      "hep", "şey", "var", "yok", "mı", "mi", "mu", "mü", "diye", "çünkü", "neden", "nasıl", "zaten", "hala", "artık", "önce",
      "ise", "değil", "hiç", "kim", "bazı", "her", "daha", "bile", "kadar", "şimdi", "vs", "vs.", "vs,", "bunu", "şunu"
    ]);

    result.recordset.forEach(row => {
      if (!row.content) return; 
      const words = row.content
        .toLowerCase()
        .replace(/[^\w\sçğıöşü]/gi, '')  
        .split(/\s+/)
        .filter(word =>
          word.length > 2 &&
          /^[a-zçğıöşü]+$/i.test(word) &&
          !stopwords.has(word)
        );

      words.forEach(word => {
        allWords[word] = (allWords[word] || 0) + 1;
      });
    });

    const wordCloudData = Object.entries(allWords)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);

    res.json(wordCloudData);
  } catch (err) {
    console.error("Word cloud API hatası:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get('/api/tweets/statistics', async (req, res) => {
  const { user_id, search_keyword } = req.query;

  if (!user_id || !search_keyword) {
    return res.status(400).json({ error: "user_id ve search_keyword gereklidir." });
  }

  try {
    const pool = await sql.connect(config);

    
    const totalQuery = await pool.request()
      .input('user_id', sql.Int, parseInt(user_id))
      .input('search_keyword', sql.VarChar, search_keyword.toLowerCase())
      .query(`
        SELECT COUNT(*) AS total
        FROM Tweets
        WHERE created_by_user_id = @user_id AND LOWER(search_keyword) = @search_keyword
      `);

    
    const sentimentQuery = await pool.request()
      .input('user_id', sql.Int, parseInt(user_id))
      .input('search_keyword', sql.VarChar, search_keyword.toLowerCase())
      .query(`
        SELECT sentiment, COUNT(*) AS count
        FROM Tweets
        WHERE created_by_user_id = @user_id AND LOWER(search_keyword) = @search_keyword
        GROUP BY sentiment
      `);

    const stats = {
      total: totalQuery.recordset[0].total,
      positive: 0,
      negative: 0,
      neutral: 0
    };

    sentimentQuery.recordset.forEach(row => {
      const sentiment = row.sentiment?.toLowerCase();
      if (sentiment === 'positive') stats.positive = row.count;
      else if (sentiment === 'negative') stats.negative = row.count;
      else if (sentiment === 'neutral') stats.neutral = row.count;
    });

    res.json(stats);
  } catch (err) {
    console.error("Tweet istatistikleri alınamadı:", err);
    res.status(500).json({ error: "Tweet istatistikleri alınamadı" });
  }
});



app.post('/generate-report', async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    // Tweetleri veritabanından al
    const tweets = await fetchTweets(keyword);

    if (tweets.length === 0) {
      return res.status(404).json({ message: "No tweets found for the given keyword" });
    }

    // Rapor dosyasını oluştur
    const reportPaths = await generateReport(tweets, keyword);

    res.status(200).json({
      message: "Report generated successfully",
      csvFilePath: reportPaths.csvPath,
      pdfFilePath: reportPaths.pdfPath
    });

  } catch (error) {
    console.error("Rapor oluşturulurken hata:", error);
    res.status(500).json({ error: "Internal server error while generating report" });
  }
});




//Rapor listeleme
app.get('/api/reports', (req, res) => {
  const reportDir = path.join(__dirname, 'report_files');

  fs.readdir(reportDir, (err, files) => {
    if (err) {
      console.error("❌ Dosyalar okunamadı:", err);
      return res.status(500).json({ error: 'Dosya okuma hatası' });
    }

    const reports = files.map((filename) => {
      const ext = filename.split('.').pop();
      const nameWithoutExt = filename.replace(`.${ext}`, '');
      const segments = nameWithoutExt.split('_');
      const keyword = segments.slice(1, -2).join(' ');

      return {
        name: keyword || filename,
        date: fs.statSync(path.join(reportDir, filename)).mtime.toISOString(),
        format: ext.toUpperCase(),
        filename: filename,
        url: `/reports/download/${filename}`
      };
    });

    res.json(reports);
  });
});

//Rapor dosyası indirme
app.get('/reports/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'report_files', filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Rapor silme işlemi
app.delete('/reports/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'report_files', filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath); // Dosyayı sil
    res.status(200).json({ message: `${filename} silindi.` });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});


app.listen(3001, () => {
  console.log('🚀 Server is running on http://localhost:3001');
});
