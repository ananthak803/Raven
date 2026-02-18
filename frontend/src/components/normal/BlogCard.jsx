import React from "react";

const BlogCard = ({
  image,
  title,
  description,
  date,
  authors = [],
}) => {
  return (
    <div className="max-w-sm overflow-hidden rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-all">

      <div className="h-48 w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex items-center justify-between px-5 pb-5">
  
        <div className="flex -space-x-3">
          {authors.map((author, index) => (
            <div
              key={index}
              className="group relative"
            >
              <img
                src={author.avatar}
                alt={author.name}
                className="h-8 w-8 rounded-full border-2 border-black group-hover:z-10"
              />
              <span className="absolute -top-9 left-1/2 -translate-x-1/2 scale-0 rounded bg-black px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                {author.name}
              </span>
            </div>
          ))}
        </div>
        {date && (
          <span className="text-xs text-white/50">
            {date}
          </span>
        )}
      </div>
    </div>
  );
};

export default BlogCard;
