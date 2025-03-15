
import * as React from "react"
import { ClipboardCopy } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  copyable?: boolean;
  onCopy?: () => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, copyable, onCopy, ...props }, ref) => {
    const copyToClipboard = () => {
      if (props.value) {
        navigator.clipboard.writeText(props.value.toString());
        if (onCopy) onCopy();
      }
    };

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 font-sans resize-vertical",
            className
          )}
          ref={ref}
          {...props}
        />
        {copyable && props.value && (
          <button
            type="button"
            onClick={copyToClipboard}
            className="absolute top-3 right-3 p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            aria-label="Copy to clipboard"
          >
            <ClipboardCopy size={16} />
          </button>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
