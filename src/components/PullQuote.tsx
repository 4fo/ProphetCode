interface PullQuoteProps {
  text: string;
  attribution?: string;
}

/** A styled pull-quote for emphasizing key statements within an article. */
export default function PullQuote({ text, attribution }: PullQuoteProps) {
  return (
    <figure className="pull-quote my-6 mx-0">
      <blockquote className="m-0 p-0">
        <p className="m-0">&ldquo;{text}&rdquo;</p>
      </blockquote>
      {attribution && (
        <figcaption className="mt-2 text-xs text-muted/60 font-serif not-italic">
          &mdash; {attribution}
        </figcaption>
      )}
    </figure>
  );
}
