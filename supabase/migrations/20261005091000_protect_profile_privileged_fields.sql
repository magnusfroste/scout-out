-- Användare kunde uppdatera hela sin egen profilrad, inklusive is_admin och
-- credits, och därmed göra sig själva till admin eller ge sig obegränsat med
-- krediter. Klientanrop (anon/authenticated) får nu inte ändra is_admin eller
-- is_demo, och credits får bara minska (appen drar krediter från klienten).
-- Servern (service_role, t.ex. stripe-webhook) och SECURITY DEFINER-funktioner
-- som reset_demo_credits påverkas inte.
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.is_admin is distinct from old.is_admin then
      raise exception 'is_admin kan inte ändras av användaren';
    end if;
    if new.is_demo is distinct from old.is_demo then
      raise exception 'is_demo kan inte ändras av användaren';
    end if;
    if coalesce(new.credits, 0) > coalesce(old.credits, 0) then
      raise exception 'credits kan inte ökas av användaren';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields on public.profiles;
create trigger protect_profile_privileged_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

-- reset_demo_credits körs av pg_cron som postgres; klienter behöver den inte.
revoke execute on function public.reset_demo_credits() from public, anon, authenticated;
