export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white rounded-[16px_16px_16px_4px] border border-[#d9e6f2] shadow-holo-bubble w-fit animate-ceci-message-in">
      <span className="h-[7px] w-[7px] rounded-full bg-[#38bdf8] shadow-[0_0_6px_rgba(56,189,248,0.7)] animate-ceci-dot-bounce" />
      <span className="h-[7px] w-[7px] rounded-full bg-[#38bdf8] shadow-[0_0_6px_rgba(56,189,248,0.7)] animate-ceci-dot-bounce" style={{ animationDelay: '0.18s' }} />
      <span className="h-[7px] w-[7px] rounded-full bg-[#38bdf8] shadow-[0_0_6px_rgba(56,189,248,0.7)] animate-ceci-dot-bounce" style={{ animationDelay: '0.36s' }} />
    </div>
  );
}
