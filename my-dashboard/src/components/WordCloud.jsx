import React, { useEffect, useState, useContext } from "react";
import cloud from "d3-cloud";
import { SearchContext } from "../context/SearchContext";

const WordCloudComponent = ({ refreshTrigger, dateRange }) => {
  const { searchKeyword } = useContext(SearchContext);
  const [rawData, setRawData] = useState([]);
  const [layoutWords, setLayoutWords] = useState([]);
  const [size, setSize] = useState({ width: 400, height: 400 });

  
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 480) setSize({ width: 250, height: 250 });
      else if (width < 768) setSize({ width: 320, height: 320 });
      else setSize({ width: 400, height: 400 });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (!searchKeyword || !dateRange?.start || !dateRange?.end) {
      setRawData([]); 
      return;
    }

    const params = new URLSearchParams({
      startDate: dateRange.start,
      endDate: dateRange.end,
    });

    fetch(`http://localhost:3001/api/tweets/word-cloud?${params}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Kelime bulutu verisi:", data);
        if (Array.isArray(data) && data.length > 0) {
          setRawData(data);
        } else {
          console.error("Beklenmeyen veri formatı:", data);
        }
      })
      .catch((err) => console.error("Kelime bulutu verisi alınamadı:", err));
  }, [refreshTrigger, dateRange]); 

  useEffect(() => {
    if (rawData.length === 0) return;

    const stopwords = [
      "rt", "https", "http", "media", "replying", "to", "be", "the",
      "bir", "ve", "ama", "bu", "da", "de", "ile", "şu", "çok", "gibi",
      "için", "ne", "ya", "ben", "sen", "biz", "siz", "onlar", "var", "yok",
      "olan", "en", "mi", "mı", "mu", "mü", "ki", "şey", "hani", "diye", "artık"
    ];

    const isEnglishWord = (word) => {
      return /^[a-zA-Z]+$/.test(word); 
    };

    const turkishRegex = /^[a-zA-ZçğıöşüÇĞİÖŞÜ]+$/;

    const layout = cloud()
      .size([size.width, size.height])
      .words(
        rawData
          .map((d) => ({
            text: d.text,
            value: d.value,  
            sentiment: d.sentiment,
          }))
          .filter(
            (d) =>
              d.text.length >= 3 &&
              isNaN(d.text) &&
              d.value >= 2 &&
              turkishRegex.test(d.text) &&
              !stopwords.includes(d.text.toLowerCase()) &&
              !isEnglishWord(d.text)  
          )
      )
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font("Poppins, sans-serif")
      .fontSize((d) => Math.max(d.value * 1.5, 14))  
      .spiral("archimedean")
      .on("end", (words) => {
        console.log("Words layout:", words); 
        if (words.length === 0) {
          console.error("Layout oluşturulamadı: Veriler boş.");
        }
        setLayoutWords(words);
      });

    layout.start();
  }, [rawData, size]); 

  const getColor = (sentiment) => {
    switch (sentiment) {
      case "positive": return "#10B981";
      case "negative": return "#EF4444";
      default: return "#6B7280";
    }
  };

  return (
    <div className="w-full overflow-x-auto flex justify-center items-center">
      {layoutWords.length === 0 ? (
        <p className="text-sm text-white/70 italic text-center">
          Veri bulunamadı. Lütfen arama yapın.
        </p>
      ) : (
        <svg width={size.width} height={size.height}>
          <g transform={`translate(${size.width / 2},${size.height / 2})`}>
            {layoutWords.map((d, i) => (
              <text
                key={i}
                style={{
                  fontSize: d.size,
                  fontWeight: "bold",
                  fill: getColor(d.sentiment),
                  transition: "all 0.3s ease-in-out",
                }}
                textAnchor="middle"
                transform={`translate(${d.x},${d.y}) rotate(${d.rotate})`}
              >
                {d.text}
              </text>
            ))}
          </g>
        </svg>
      )}
    </div>
  );
};

export default WordCloudComponent;

