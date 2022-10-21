/* eslint-disable no-console */
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const RSS = require('rss');
const matter = require('gray-matter');

(async () => {
  console.info(chalk.cyan('info'), ` - Generating RSS feed`);

  const root = process.cwd();

  const typeToPath = {
    blog: 'content',
  };

  function getPosts(type) {
    const files = fs
      .readdirSync(path.join(root, typeToPath[type]))
      .filter((name) => name !== 'img');

    const posts = files.reduce((allPosts, postSlug) => {
      const source = fs.readFileSync(
        path.join(root, typeToPath[type], postSlug),
        'utf8'
      );
      const { data } = matter(source);

      return [
        {
          ...data,
          slug: postSlug.replace('.mdx', ''),
        },
        ...allPosts,
      ];
    }, []);

    return posts;
  }

  try {
    const feed = new RSS({
      title: "Rev. Abraham Varghese",
      description:
        "Hi! I'm Abraham, Servant of the Lord Jesus Christ, Husband And Dad. Here, I share through my writing my experience as a pastor at BethelAG and everything I'm learning/experiencing in my life!",
      site_url: 'https://octa-portfolio.vercel.app/',
      feed_url: 'https://octa-portfolio.vercel.app/rss.xml',
      image_url: '#',
      language: 'en',
    });

    const content = [
      ...getPosts('blog'),
      ...getPosts('snippet'),
    ].sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

    content.forEach((post) => {
      const url = `https://octa-portfolio.vercel.app/${
        post.type === 'posts'
      }/${post.slug}`;

      feed.item({
        title: post.title,
        description: post.type === 'snippet' ? '' : post.subtitle,
        date: new Date(post.date),
        author: 'Maxime heckel',
        url,
        guid: url,
      });
    });

    const rss = feed.xml({ indent: true });
    fs.writeFileSync(path.join(__dirname, '../public/rss.xml'), rss);
  } catch (error) {
    console.error(
      chalk.red('error'),
      ` - An error occurred while generating the RSS feed`
    );
    console.error(error);
    process.exit(1);
  }
})();
