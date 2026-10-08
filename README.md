OdysseaVision

Wild stories from land and sea.

OdysseaVision is a photography and filmmaking platform created to showcase the work of Andrew & Morgane. Built around wildlife, the ocean and responsible storytelling, it combines an immersive public-facing experience with the tools needed to manage a growing creative portfolio.
The goal: let the images and stories take center stage, while keeping publishing and client delivery manageable behind the scenes.

Highlights

Immersive visual storytelling — photography-led layouts, editorial sections and carefully considered motion.
Photography & video portfolio — dedicated galleries, project pages and video showcases.
Stories & articles — a space for longer-form narratives and conservation-focused content.
Private client albums — client-specific photo collections with configurable access, sharing and download options.
Custom administration — manage portfolio entries, stories, videos, albums, appearance, navigation and SEO without editing code.
Content-focused tooling — rich-text editing, media uploads and sortable content collections.

Tech stack

Layer	Technologies
Application	Next.js 16 (App Router), React 19, TypeScript
Interface	Tailwind CSS 4, Framer Motion
Data	Prisma, PostgreSQL
Content management	Tiptap, dnd-kit
Media	Vercel Blob integration, Vimeo support, Sharp

Run locally

Requirements: Node.js compatible with Next.js 16, npm and a PostgreSQL database.
```bash
git clone https://github.com/nolhancolas-ctrl/odysseavision.git
cd odysseavision
npm install
```
Create a `.env.local` file and configure the database connection values used by Prisma:
```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```
The application also uses optional service integrations for features such as media storage and email. Configure those separately when using the corresponding features; never commit real credentials.
```bash
npm run db:generate
npm run db:migrate
npm run dev
```
Open http://localhost:3000. The public website and the protected `/admin` area are separate experiences; administrative access requires its own configuration.

Project structure

```text
src/app/          Routes, pages and server endpoints
src/components/   Public UI and administration components
src/lib/          Content, authentication and supporting logic
prisma/           Database schema and migrations
public/           Static assets
```

Creative direction

An editorial, nature-inspired visual language designed to support storytelling rather than compete with it. The project explores how design, technology and photography can work together to make stories more engaging and accessible.
---

Development: Nolhan Colas · GitHub
Photography, films and creative identity belong to their respective creators.
