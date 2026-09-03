import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { USER_SUSPEND_THRESHOLD, SUSPEND_DURATION_HOURS } from '../../shared/moderation.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const reportedUserId = body?.reported_user_id;
    const reason = body?.reason;
    const note = body?.note || '';
    if (!reportedUserId || !reason) {
      return Response.json({ error: 'reported_user_id and reason required' }, { status: 400 });
    }

    // No self-reports.
    if (reportedUserId === user.id) return Response.json({ ok: true, self: true });
    // Suspended/banned users can't report.
    const myStatus = user.status || 'active';
    if (myStatus === 'suspended' || myStatus === 'banned') {
      return Response.json({ ok: true, blocked: true });
    }

    // De-dupe: one report per reporter per target.
    const existing = await base44.asServiceRole.entities.UserFlag.filter(
      { reported_user_id: reportedUserId, created_by_id: user.id },
      '-created_date',
      1
    );
    if (existing && existing.length) {
      return Response.json({ ok: true, alreadyFlagged: true });
    }

    // Create as the user so created_by_id is stamped correctly.
    await base44.entities.UserFlag.create({
      reported_user_id: reportedUserId,
      reporter_id: user.id,
      reason,
      note,
      status: 'open'
    });

    // Count distinct ACTIVE reporters (exclude suspended/banned reporters).
    const all = await base44.asServiceRole.entities.UserFlag.filter(
      { reported_user_id: reportedUserId },
      '-created_date',
      200
    );
    const ids = [...new Set((all || []).map((f) => f.created_by_id))];
    const active = [];
    for (const rid of ids) {
      if (rid === reportedUserId) continue;
      try {
        const u = await base44.asServiceRole.entities.User.get(rid);
        if (u && (!u.status || u.status === 'active')) active.push(rid);
      } catch { /* skip unreadable */ }
    }

    let suspended = false;
    if (active.length >= USER_SUSPEND_THRESHOLD) {
      try {
        const until = new Date(Date.now() + SUSPEND_DURATION_HOURS * 3600 * 1000).toISOString();
        await base44.asServiceRole.entities.User.update(reportedUserId, { status: 'suspended', suspended_until: until });
        suspended = true;
      } catch { /* target may be unreachable */ }
    }

    return Response.json({ ok: true, suspended, reporterCount: active.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}