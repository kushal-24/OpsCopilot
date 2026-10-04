import { useTheme } from '../../theme/theme'
import { Sun, Moon, Palette, CheckCircle2 } from 'lucide-react'

/**
 * AppearanceSettings — Interactive theme toggle cards for Dark Mode vs Light Mode switching.
 */
export default function AppearanceSettings() {
  const { isDark, toggleTheme, setTheme } = useTheme()

  return (
    <div className="rounded-card border border-border bg-surface p-4 sm:p-6 shadow-card space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
          <Palette size={18} />
        </div>
        <div>
          <h3 className="font-head text-sm sm:text-base font-semibold text-text tracking-tight">
            Appearance & Interface Theme
          </h3>
          <p className="text-[11px] sm:text-xs text-muted">Customize visual theme and ambient surface lighting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Dark Mode Card */}
        <div
          onClick={() => setTheme('dark')}
          className={`p-4 rounded-card border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
            isDark
              ? 'border-primary bg-surface-2 shadow-[0_0_20px_rgba(109,85,250,0.25)]'
              : 'border-border bg-surface/60 hover:border-primary/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-surface border border-border text-primary">
                <Moon size={18} />
              </div>
              <div>
                <h4 className="font-head text-sm font-semibold text-text">Dark Mode (Obsidian)</h4>
                <p className="text-[11px] text-muted">Deep void surfaces with electric violet accents</p>
              </div>
            </div>
            {isDark && <CheckCircle2 size={18} className="text-primary shrink-0" />}
          </div>

          <div className="h-10 rounded-lg bg-[#08070C] border border-[#222033] p-2 flex items-center gap-2 text-[10px] font-mono text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6D55FA]" />
            <span>#08070C Obsidian Surface</span>
          </div>
        </div>

        {/* Light Mode Card */}
        <div
          onClick={() => setTheme('light')}
          className={`p-4 rounded-card border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
            !isDark
              ? 'border-primary bg-surface-2 shadow-[0_0_20px_rgba(109,85,250,0.25)]'
              : 'border-border bg-surface/60 hover:border-primary/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-surface border border-border text-warning">
                <Sun size={18} />
              </div>
              <div>
                <h4 className="font-head text-sm font-semibold text-text">Light Mode (Ivory)</h4>
                <p className="text-[11px] text-muted">Crisp off-white surfaces with high contrast</p>
              </div>
            </div>
            {!isDark && <CheckCircle2 size={18} className="text-primary shrink-0" />}
          </div>

          <div className="h-10 rounded-lg bg-[#F8F9FC] border border-[#E2E5EE] p-2 flex items-center gap-2 text-[10px] font-mono text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6D55FA]" />
            <span>#F8F9FC Ivory Surface</span>
          </div>
        </div>
      </div>
    </div>
  )
}
