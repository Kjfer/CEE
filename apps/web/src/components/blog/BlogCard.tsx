import { Link } from 'react-router-dom';
import type { BlogPost } from '@cee/types';
import { ROUTES } from '@/constants/routes';

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const postUrl = ROUTES.BLOG_POST.replace(':slug', post.slug);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="w-full bg-muted" style={{ aspectRatio: '16 / 9' }}>
        <img
          src={post.imageUrl}
          alt={post.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-medium uppercase tracking-widest text-cee-red">
          {dateFormatter.format(new Date(post.date))}
        </p>
        <Link to={postUrl} className="text-lg font-semibold hover:text-cee-red">
          {post.title}
        </Link>
        <p className="line-clamp-3 text-sm text-muted-foreground">{post.summary}</p>
        <Link to={postUrl} className="mt-auto pt-2 text-sm font-semibold text-cee-red hover:underline">
          Leer más →
        </Link>
      </div>
    </article>
  );
}
