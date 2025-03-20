
import * as React from "react"
import { ClipboardCheck, ClipboardCopy } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  copyable?: boolean;
  onCopy?: () => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, copyable, onCopy, ...props }, ref) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const copyToClipboard = () => {
      if (props.value) {
        navigator.clipboard.writeText(props.value.toString());
        setIsCopied(true);
        if (onCopy) onCopy();
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
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
            className={cn(
              "absolute top-3 right-3 p-2 rounded-md flex items-center gap-1 transition-all",
              isCopied 
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            )}
            aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
          >
            {isCopied ? (
              <>
                <ClipboardCheck size={16} />
                <span className="text-xs font-medium">Copied!</span>
              </>
            ) : (
              <>
                <ClipboardCopy size={16} />
                <span className="text-xs font-medium">Copy</span>
              </>
            )}
          </button>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
