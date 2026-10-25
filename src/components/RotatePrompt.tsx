import React from 'react';
import { Smartphone, RotateCw } from 'lucide-react';

interface RotatePromptProps {
  nightMode: boolean;
}

export const RotatePrompt: React.FC<RotatePromptProps> = ({ nightMode }) => {
  return (
    <div
      id="rotate-orientation-prompt"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center transition-colors duration-500 ${
        nightMode ? 'bg-stone-950 text-stone-100' : 'bg-[#faf7f5] text-stone-900'
      }`}
    >
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Animated Phone Rotation Illustration */}
        <div className="relative mb-8 flex items-center justify-center">
          <div
            className={`w-28 h-28 rounded-3xl flex items-center justify-center border shadow-organic-md transition-all ${
              nightMode
                ? 'bg-stone-900 border-stone-800 text-stone-100'
                : 'bg-white border-[#e8e2de] text-stone-900'
            }`}
          >
            <div className="animate-bounce">
              <Smartphone className="w-14 h-14 transform rotate-90 transition-transform duration-700 text-[#6b2c91] dark:text-purple-400" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#d97736] text-white p-2 rounded-full shadow-md animate-spin" style={{ animationDuration: '4s' }}>
            <RotateCw className="w-4 h-4" />
          </div>
        </div>

        {/* Primary Prompt Typography */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          請將裝置旋轉為橫向
        </h2>
        <p className="text-sm sm:text-base font-semibold text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
          富康花園智慧儀表板專為橫向螢幕（iPad / 智慧家居 Kiosk）設計，請旋轉手機或平板以獲得完整全螢幕免捲動體驗。
        </p>

        {/* English Subtitle */}
        <div
          className={`px-4 py-3 rounded-2xl border text-xs sm:text-sm font-medium ${
            nightMode
              ? 'bg-stone-900/60 border-stone-800 text-stone-400'
              : 'bg-white/70 border-[#e8e2de] text-stone-600'
          }`}
        >
          Please rotate your device to landscape mode for the full dashboard view.
        </div>
      </div>
    </div>
  );
};
