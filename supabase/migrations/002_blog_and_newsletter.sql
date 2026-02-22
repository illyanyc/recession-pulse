-- Blog posts table for automated content marketing
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  meta_description TEXT,
  keywords TEXT[],
  og_image_url TEXT,
  content_type TEXT NOT NULL DEFAULT 'weekly_report' CHECK (content_type IN ('weekly_report', 'deep_dive', 'market_commentary')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

-- Auto-update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS: blog posts are publicly readable
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_posts FOR SELECT
  USING (status = 'published');

-- Newsletter subscribers for free-tier growth
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source TEXT DEFAULT 'website',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX idx_newsletter_status ON public.newsletter_subscribers(status) WHERE status = 'active';

-- RLS: newsletter is managed by service role only
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Social posts log for tracking automated social media posts
CREATE TABLE public.social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'reddit', 'linkedin')),
  post_type TEXT NOT NULL CHECK (post_type IN ('daily_briefing', 'status_change', 'weekly_thread', 'blog_promo', 'manual')),
  content TEXT NOT NULL,
  external_id TEXT,
  blog_post_id UUID REFERENCES public.blog_posts(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed')),
  error TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_social_posts_platform ON public.social_posts(platform, posted_at DESC);
CREATE INDEX idx_social_posts_status ON public.social_posts(status);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
