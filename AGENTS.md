<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


<claude-mem-context>
# Memory Context

# [web] recent context, 2026-06-30 6:38pm GMT+5:30

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (20,458t read) | 899,261t work | 98% savings

### Jun 30, 2026
5578 5:10p 🚨 GitHub Personal Access Token Exposed in Session Message
S5108 Kentelle Pro-Gate Sprint — Full implementation committed locally, awaiting Hostinger redeploy after GitHub push unblock (Jun 30 at 5:10 PM)
S5110 Kentelle — WordPress-Style Blog Editor CMS Upgrade for Existing Next.js Admin (Prisma-based, no Payload CMS) (Jun 30 at 5:12 PM)
5579 5:25p ⚖️ WordPress-Style Blog Editor CMS — Full Spec Scoped for Existing Next.js Admin
5580 5:26p 🔵 Kentelle Existing Blog Admin — Current State Before WordPress-Style Upgrade
S5119 WordPress-Style Blog CMS — Complete Implementation Summary for Kentelle Next.js Admin (Jun 30 at 5:27 PM)
5582 5:27p 🚨 Kentelle — Supabase Service Role Key + Database URL Exposed in Session
5583 5:28p 🔵 Kentelle Blog [id] API Route — PUT/DELETE Implementations Confirmed
5584 " ✅ Kentelle WordPress-Style Blog Editor — TipTap Dependencies Installation Started
5585 " 🔵 Kentelle Prisma Schema — Full 198-Line Structure with Blog Model Baseline
5587 " 🟣 Kentelle Prisma Schema — Blog Model Extended with WordPress-Style Fields
5588 5:32p 🟣 Kentelle — TipTapEditor Component Created with Full WordPress-Style Toolbar
5590 5:34p 🟣 Kentelle — BlogEditorClient Created: Full WordPress-Style Editor with Sidebar, AI Panel, Auto-Save, Revisions
5591 5:35p 🟣 Kentelle Blog API Route — GET List + Enhanced POST with WordPress-Style Fields
5593 5:36p 🟣 Kentelle Blog Admin List Page — Full WordPress-Style UI with Status Tabs, Search, Quick Edit, Pagination
5594 " 🟣 Kentelle Blog [id] API Route — GET, PUT with Revisions, Soft-Delete, PATCH Restore
5595 5:37p 🟣 Kentelle Blog Edit Page — Refactored to Use New BlogEditorClient Component
5596 " 🟣 Kentelle New Blog Post Page — Minimal Create Form Redirects to Full Editor
5597 " 🟣 Kentelle AI Write Endpoint — Gemini-Powered Blog Post Generation
5598 " 🟣 Kentelle AI Improve Endpoint — Gemini-Powered Content Rewriting
5599 5:38p 🟣 Kentelle AI SEO Check Endpoint — Gemini-Powered Blog Post Analysis
5600 " ✅ Prisma Client Regenerated — Blog Schema Updated with WordPress-Style Fields
5603 " ✅ Tailwind Typography Plugin Registered in globals.css
5605 5:41p 🟣 WordPress-Style Blog CMS — Complete Implementation Summary for Kentelle Next.js Admin
5606 " 🔵 Kentelle Blog CMS — Prisma Migration Pending Before Runtime Use
S5120 Kentelle — WordPress-Style Blog Editor CMS: TipTap v3 Compatibility Fixes + TypeScript Errors Resolved (Jun 30 at 5:41 PM)
S5123 Kentelle Blog CMS — "Add Post" Flow Fixed with Error Handling + DB Migration Fallback (Jun 30 at 5:41 PM)
5607 5:43p 🔵 Kentelle Blog CMS — "Add Post" Button Fails to Open Editor
5609 " 🔴 Kentelle Blog CMS — "Add Post" Flow Fixed with Error Handling + DB Migration Fallback
S5126 Kentelle Blog CMS — "Add Post" blank screen bug fixed with error handling and DB migration fallback (Jun 30 at 5:43 PM)
S5135 Kentelle Blog CMS — POST /api/admin/blog Now Returns 201, "Add Post" Flow Fully Working (Jun 30 at 5:43 PM)
5610 5:44p 🔵 Kentelle — Prisma Config Confirmed, psql CLI Not Available on Dev Machine
5611 " 🔵 Kentelle — Direct pg Client Migration to Supabase Fails with SSL Certificate Error
5613 5:45p 🔵 Kentelle — Supabase Rejects Unencrypted pg Connections via pg_hba.conf
5614 " ✅ Kentelle — Blog Table Migration Applied Successfully to Supabase Production DB
5615 " 🔵 Kentelle — Blog Table Schema Confirmed + POST API Still Returns 500 After Migration
5616 " 🔵 Kentelle — Blog List API (GET) Returns 200, Confirming Server Up + POST-Only 500 Bug
5617 5:46p 🔵 Kentelle Blog POST 500 — Root Cause: Missing "updatedAt" Column in Blog Table Schema Cache
5618 " 🔴 Kentelle lib/db.ts — blogCreate and blogUpdate Fixed by Removing updatedAt References
5619 5:47p 🔴 Kentelle Blog CMS — POST /api/admin/blog Now Returns 201, "Add Post" Flow Fully Working
S5137 Kentelle Blog CMS — "Add Post" blank screen bug fully fixed; blog creation and editor flow now working end-to-end (Jun 30 at 5:47 PM)
S5142 Kentelle Blog Detail Page Rebuild — TypeScript Clean, 404 Confirmed for Unknown Slugs (Jun 30 at 5:47 PM)
5620 5:51p ⚖️ Kentelle Blog Detail Page — Two-Column Layout with TOC Scoped from Figma
5621 5:52p 🔵 Kentelle Blog Detail Page — Current Implementation Before Redesign
5623 " 🟣 Kentelle Blog — Sticky Table of Contents Component Created
5624 " 🟣 Kentelle Blog Detail Page — Magazine Two-Column Layout Fully Implemented
5626 5:53p 🔵 Kentelle Blog Detail Page Rebuild — TypeScript Clean, 404 Confirmed for Unknown Slugs
S5144 Kentelle Blog Detail Page — Two-Column Magazine Layout Redesign from Figma Reference (Image #10) (Jun 30 at 5:53 PM)
5627 " 🔄 Kentelle Admin Blog "New Post" — Instant-Create Server Action Replaces Title-First Form
5628 5:54p 🔵 Kentelle Admin BlogEditorClient — 669-Line Full WordPress-Style Editor Component Confirmed
5629 5:56p 🔵 Kentelle BlogEditorClient — Auto-Save, Reading Time Calc, and Publish Logic Confirmed
5631 5:57p 🔄 Kentelle BlogEditorClient — WordPress-Style Top Bar + Sticky Sidebar + Unified AI Run() Refactor
5632 " 🔵 Kentelle Blog CMS — Full Git Diff Shows 1,451-Line Change Scope Across 13 Modified + 4 New Files
5634 " 🟣 Kentelle TipTapEditor — 180-Line Rich Text Editor Component with Full Toolbar
5635 " 🔵 Kentelle Sitemap — Blog Posts Already Included with published:true Filter
5636 5:58p 🔵 Kentelle Admin Upload API — Supabase Storage Upload Uploads to "products" Bucket, Not "blog"
5637 " 🟣 Kentelle Blog Media Upload API — New /api/admin/blog/media Route for Blog Image Uploads
5639 5:59p 🟣 Kentelle TipTapEditor — window.prompt Image Insertion Replaced with Drag-Drop MediaModal
5640 " ✅ Kentelle Sitemap — /product-layering Page Added as Static Route at Priority 0.7
5641 6:01p 🔵 Kentelle — TypeScript Check Passes Zero Errors After TipTapEditor MediaModal + Sitemap Changes

Access 899k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>