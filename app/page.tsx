"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { BsSun, BsMoon, BsTwitterX } from "react-icons/bs";
import Snowfall from '@/components/ui/snowfall';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
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

    // 5秒ごとにハートビート送信
    const heartbeatInterval = setInterval(() => {
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => setActiveConnections(data.activeConnections))
        .catch(console.error);
    }, 5000);

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
  const { theme, setTheme } = useTheme();
  return (
    <>
    {theme === "dark" && <Snowfall count={100} />}
    <div className="absolute top-6 right-6 flex flex-row gap-3">
      <div className="flex items-center space-x-2">
        <BsSun className="h-6 w-6" />
        <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} /> {/* 追加 */}
        <BsMoon className="h-6 w-6" />
      </div>
      <a href="https://x.com/intent/tweet?text=みんなでクリスマスを迎えよう&url=https%3A%2F%2Falone-christmas.me&hashtags=クリぼっちカウンター"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex items-center justify-center w-12 h-12 bg-accent hover:bg-accent/90 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        aria-label="クリスマスをツイッターで共有
      ">
        <BsTwitterX className="w-8 h-8 text-accent-foreground" />
      </a>
    </div>
    <div
      className={`min-h-screen flex items-center justify-center gap-16 ${InterFont.className}`}
    >
      <p className="text-3xl md:text-6xl w-[350px] md:w-[400px]">
        {timeLeft.days}:{timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
      </p>
      <div className="border-l border  h-36"></div>
      <div>
        <p
          className={`text-xl md:text-3xl ${NotoSansJPFont.className} font-light`}
        >
          現在のクリぼっちの人数
        </p>
        <p
          className={`text-3xl md:text-6xl ${NotoSansJPFont.className} font-normal`}
        >
          <BsTwitterX className="w-8 h-8 text-accent-foreground" />
        </a>
      </div>
      <div
        className={`min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-6 md:px-0 ${InterFont.className}`}
      >
        <p className="text-3xl md:text-6xl w-full max-w-[400px] text-center md:text-left">
          {timeLeft.days}:{timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
        </p>
        <div className="hidden md:block border-l border h-36" />
        <div className="w-full max-w-[400px] text-center md:text-left">
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
    </>
  );
}
