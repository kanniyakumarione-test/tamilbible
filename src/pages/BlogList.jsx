import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";

export default function BlogList() {
  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <div className="mb-8 rounded-[2rem] border border-white/10 bg-[#000000] p-6 shadow-2xl md:p-8">
        <h1 className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">
          தமிழ் வேதாகமம் Blog
        </h1>
        <p className="mt-3 text-stone-400">
          News, updates, and helpful articles about using Tamil Bible Premium in your personal study and church services.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="group flex flex-col rounded-[2rem] border border-white/10 bg-[#000000] p-6 transition-all hover:border-white/20 hover:bg-white/[0.02]"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-stone-300">
                Article
              </span>
              <span className="text-xs text-stone-500">{post.date}</span>
            </div>
            <h2 className="mb-3 text-xl font-bold text-white transition-colors group-hover:text-stone-300">
              {post.title}
            </h2>
            <p className="mb-6 flex-1 text-sm leading-relaxed text-stone-400">
              {post.excerpt}
            </p>
            <div className="mt-auto flex items-center text-sm font-semibold text-stone-300">
              Read Article 
              <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
