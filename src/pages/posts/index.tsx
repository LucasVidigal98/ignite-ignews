import { GetStaticProps } from "next";
import Head from "next/head";
import { predicate } from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from "../../services/prismic";

import styles from './styles.module.scss';

interface PostsProps {
  posts: Post[];
}

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: Date;
}

function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts Ignite</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <>
              <a key={post.slug} href="#">
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query([
    predicate.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.content'],
    pageSize: 100,
  });

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
    }
  });

  return {
    props: {
      posts,
    }
  }
}

export default Posts;
