DELETE FROM public.visit_history a USING public.visit_history b
WHERE a.user_id = b.user_id AND a.kind = b.kind AND a.item_id = b.item_id AND a.id < b.id;

ALTER TABLE public.visit_history
  ADD CONSTRAINT visit_history_user_kind_item_unique UNIQUE (user_id, kind, item_id);