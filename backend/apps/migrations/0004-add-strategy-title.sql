-- Migration 0004: display title on marketplace strategies.
--
-- Why: the home page cards (ui/app/strategy/[id]/components/strategy-card.tsx and
-- strategy-featured.tsx) render `strategy.title` as the card heading, but the
-- strategies table only carried the strategist name — every card headline was blank.

ALTER TABLE IF EXISTS strategies
  ADD COLUMN IF NOT EXISTS title text;
