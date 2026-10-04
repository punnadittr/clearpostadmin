-- Clearpost Admin access setup. Membership is assigned only to explicitly
-- authorized admin accounts; new Auth accounts receive no access automatically.
create schema if not exists private;
create table private.clearpost_admin_members (
    user_id uuid primary key references auth.users(id) on delete cascade
);
alter table private.clearpost_admin_members enable row level security;
revoke all on private.clearpost_admin_members from public, anon, authenticated;
grant usage on schema private to authenticated;
grant select (user_id) on private.clearpost_admin_members to authenticated;
create policy clearpost_admin_own_membership
    on private.clearpost_admin_members for select to authenticated
    using (user_id = (select auth.uid()));

create function public.can_read_suvarnabhumi_requests()
    returns boolean language sql stable security invoker set search_path = ''
    as $$ select exists (
        select 1 from private.clearpost_admin_members where user_id = (select auth.uid())
    ); $$;
revoke all on function public.can_read_suvarnabhumi_requests() from public, anon;
grant execute on function public.can_read_suvarnabhumi_requests() to authenticated;

grant select on public.suvarnabhumi_clearance_requests to authenticated;
create policy suvarnabhumi_admin_read
    on public.suvarnabhumi_clearance_requests for select to authenticated
    using (exists (
        select 1 from private.clearpost_admin_members
        where user_id = (select auth.uid())
    ));

-- Private documents can only be opened when the admin can read their request.
create policy suvarnabhumi_admin_notice_read
    on storage.objects for select to authenticated
    using (
        bucket_id = 'suvarnabhumi-notices'
        and exists (
            select 1 from public.suvarnabhumi_clearance_requests
            where storage.objects.name = any(attachment_paths)
        )
    );
