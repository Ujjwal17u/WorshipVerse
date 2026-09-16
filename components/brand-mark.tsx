import { BookOpen } from 'lucide-react'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3 text-left">
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#f3ead8] text-[#8a6a28] dark:bg-secondary dark:text-accent">
        <BookOpen size={20} strokeWidth={1.75} />
      </span>
      <span>
        <strong className="block text-[17px] font-semibold tracking-tight text-foreground">WorshipVerse</strong>
        {!compact && (
          <span className="mt-0.5 block text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Praise • Worship • Lyrics
          </span>
        )}
      </span>
    </span>
  )
}
