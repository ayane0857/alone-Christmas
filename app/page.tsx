"use client";

import { useEffect, useState } from "react";
import { Inter, Noto_Sans_JP } from "next/font/google";
const InterFont = Inter({
  weight: "400",
  subsets: ["latin"],
});
const NotoSansJPFont = Noto_Sans_JP({
  weight: ["300", "400"],
  subsets: ["latin"],
  display: "swap",
});
type TimeLeft = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

function calcTimeLeft(): TimeLeft {
  const nowDate = new Date();
  const now = Date.now();
  const year = nowDate.getUTCFullYear();
  let target = Date.UTC(year, 11, 25, 0, 0, 0);
  if (now >= target) {
    target = Date.UTC(year + 1, 11, 25, 0, 0, 0);
  }
  const distance = Math.max(0, target - now);

  const msPerSecond = 1000;
  const msPerMinute = msPerSecond * 60;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const days = Math.floor(distance / msPerDay);
  const hours = Math.floor((distance % msPerDay) / msPerHour);
  const minutes = Math.floor((distance % msPerHour) / msPerMinute);
  const seconds = Math.floor((distance % msPerMinute) / msPerSecond);

  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    days: String(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  } as TimeLeft;
}

export default function Home() {
  const [activeConnections, setActiveConnections] = useState(0);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    // 初回接続
    fetch("/api/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => setActiveConnections(data.activeConnections));

    // 30秒ごとにハートビート送信
    const heartbeatInterval = setInterval(() => {
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => setActiveConnections(data.activeConnections))
        .catch(console.error);
    }, 30000);

    // ページ離脱時に切断
    const handleBeforeUnload = () => {
      navigator.sendBeacon("/api/disconnect", JSON.stringify({ sessionId }));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // コンポーネントアンマウント時に切断
      fetch("/api/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    };
  }, [sessionId]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  return (
    <div
      className={`min-h-screen flex items-center justify-center gap-16 ${InterFont.className}`}
    >
      <p className="text-3xl md:text-6xl">
        {timeLeft.days}:{timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
      </p>
      <div className="border-l border-black h-36"></div>
      <div>
        <p
          className={`text-xl md:text-3xl ${NotoSansJPFont.className} font-light`}
        >
          現在のクリぼっちの人数
        </p>
        <p
          className={`text-3xl md:text-6xl ${NotoSansJPFont.className} font-normal`}
        >
          <span className={InterFont.className}>{activeConnections}</span>人
        </p>
      </div>
    </div>
  );
}
