import React, { useState, useEffect, useRef } from 'react';
import {
  FaPlay, FaPause, FaExpand, FaCompress,
  FaVolumeUp, FaVolumeMute, FaTimes,
  FaChevronLeft, FaChevronRight,
  FaClock, FaSpinner, FaCog
} from 'react-icons/fa';

const VideoPlayer = ({
  video,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  courseTitle = "Course Video"
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isYouTube, setIsYouTube] = useState(false);
  const [player, setPlayer] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const progressBarRef = useRef(null);
  const [playerId] = useState(`yt-${Date.now()}`);

  // تحميل API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }, []);

  // فتح الفيديو
  useEffect(() => {
    if (isOpen && video) {
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);

      const isYT = video?.lecture?.youtubeUrl;
      setIsYouTube(!!isYT);

      if (isYT) {
        setTimeout(initPlayer, 200);
      }
    }
  }, [isOpen, video]);

  const extractId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&]+)/);
    return match ? match[1] : null;
  };

  const initPlayer = () => {
    if (!window.YT || !window.YT.Player) {
      setTimeout(initPlayer, 200);
      return;
    }

    const id = extractId(video.lecture.youtubeUrl);

    const p = new window.YT.Player(playerId, {
      videoId: id,
      playerVars: { controls: 0 },
      events: {
        onReady: (e) => {
          setPlayerReady(true);
          setPlayer(p);
          setIsLoading(false);
        },
        onStateChange: (e) => {
          if (e.data === 1) setIsPlaying(true);
          else setIsPlaying(false);
        }
      }
    });
  };

  // تحديث الوقت + duration
  useEffect(() => {
    let interval;

    if (player && playerReady) {
      interval = setInterval(() => {
        try {
          const t = player.getCurrentTime();
          const d = player.getDuration();

          if (!isDragging) setCurrentTime(t);
          if (d > 0) setDuration(d);
        } catch {}
      }, 250);
    }

    return () => clearInterval(interval);
  }, [player, playerReady, isDragging]);

  const togglePlay = () => {
    if (!player) return;

    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  };

  const toggleMute = () => {
    if (!player) return;

    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const seekTo = (time) => {
    if (!player || !duration) return;

    const t = Math.max(0, Math.min(duration, time));
    player.seekTo(t, true);
    setCurrentTime(t);
  };

  const handleClick = (e) => {
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(percent * duration);
  };

  const handleDrag = (e) => {
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(percent * duration);
  };

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !video) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">

      {isLoading && (
        <FaSpinner className="text-white text-4xl animate-spin absolute" />
      )}

      <div className="w-[90%] max-w-5xl">
        <div style={{ paddingBottom: "56.25%" }} className="relative">
          <div id={playerId} className="absolute inset-0"></div>
        </div>

        {/* Controls */}
        <div className="mt-3">

          {/* Progress */}
          <div
            ref={progressBarRef}
            className="h-2 bg-gray-500 cursor-pointer relative"
            onClick={handleClick}
            onMouseDown={(e) => {
              setIsDragging(true);
              handleDrag(e);
            }}
            onMouseMove={(e) => isDragging && handleDrag(e)}
            onMouseUp={(e) => {
              handleClick(e);
              setIsDragging(false);
            }}
          >
            <div
              className="bg-green-500 h-2"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between text-white mt-2">

            <div className="flex items-center gap-3">
              <button onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>

              <button onClick={toggleMute}>
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>

              <span>{format(currentTime)} / {format(duration)}</span>
            </div>

            <button onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
